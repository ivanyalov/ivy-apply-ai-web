# 🔍 Subscription Issue - Root Cause Analysis

## Executive Summary

Users who successfully paid for subscriptions are losing access to the service. This document explains the technical root causes discovered in the codebase.

---

## 🎯 Root Causes Identified

### Critical Issue #1: Dual Payment Processing (Race Condition)

**Location:** `backend/src/routes/payment.routes.ts`

**Problem:** 
Your system has TWO separate endpoints that both create/update subscriptions:

1. **Frontend endpoint** `/cloudpayments/payment-success` (line 379-545)
   - Called directly from the frontend after widget closes
   - Creates/updates subscription in database
   - Runs asynchronously

2. **Webhook endpoint** `/cloudpayments/notify` (line 16-184)
   - Called by CloudPayments servers
   - Also creates/updates subscription in database
   - Runs asynchronously

**The Race Condition:**
```
Time 0s: User completes payment
Time 1s: Frontend calls /payment-success → Creates Subscription A (status: active, expires: +30 days)
Time 2s: CloudPayments calls /notify → Updates/Creates Subscription B
Time 3s: User tries to access → System checks wrong subscription or finds conflicting data
```

**Code Evidence:**

```typescript:379:545:backend/src/routes/payment.routes.ts
// Frontend endpoint - creates subscription
router.post("/cloudpayments/payment-success", authMiddleware, async (req, res) => {
    // ...
    // ALWAYS creates NEW subscription (line 494)
    subscription = await createSubscription({
        userId,
        planType: "premium",
        status: "active",
        // ...
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    });
});
```

```typescript:16:184:backend/src/routes/payment.routes.ts
// Webhook endpoint - also creates/updates subscription
router.post("/cloudpayments/notify", async (req, res) => {
    // ...
    if (subscription && subscription.id) {
        // Updates existing (line 125)
        await updateSubscription(subscription.id, {
            planType: "premium",
            status: "active",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
    } else {
        // Creates new (line 135)
        subscription = await createSubscription({
            // ...
        });
    }
});
```

---

### Critical Issue #2: "Latest Subscription" Logic Problem

**Location:** `backend/src/models/Subscription.ts` (line 98-120)

**Problem:**
The system retrieves subscriptions using `ORDER BY created_at DESC LIMIT 1`, which means it **always** gets the most recently created subscription, not necessarily the active or paid one.

**Code Evidence:**

```typescript:98:120:backend/src/models/Subscription.ts
export const getSubscriptionByUserId = async (userId: string): Promise<Subscription | null> => {
	const result = await pool.query(
		`SELECT 
            id, 
            user_id as "userId", 
            status, 
            plan_type as "planType", 
            start_date as "startDate", 
            expires_at as "expiresAt",
            cloudpayments_subscription_id as "cloudPaymentsSubscriptionId",
            cloudpayments_token as "cloudPaymentsToken",
            cloudpayments_transaction_id as "cloudPaymentsTransactionId",
            cancelled_at as "cancelledAt",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM subscriptions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1`,  // ← PROBLEM: Only gets latest by creation time
		[userId]
	);
	return result.rows[0] || null;
};
```

**Scenario Where This Fails:**
1. User has old trial subscription (created_at: Jan 1, status: cancelled)
2. User pays for premium (created_at: Jan 5, status: active)
3. System creates another record due to webhook (created_at: Jan 5, status: cancelled)
4. Query returns the cancelled one because it was created last

---

### Critical Issue #3: Access Check Logic

**Location:** `backend/src/services/subscription.service.ts` (line 119)

**Problem:**
For a user to have access, ALL THREE conditions must be met:

```typescript:119:119:backend/src/services/subscription.service.ts
const hasAccess = subscription.status === "active";
```

But earlier in the same function (line 105-116):

```typescript:104:117:backend/src/services/subscription.service.ts
const now = new Date();
if (subscription.expiresAt && subscription.expiresAt <= now) {
    // Subscription has expired, update status
    if (subscription.id) {
        await updateSubscription(subscription.id, { status: "unsubscribed" });
    }
    return {
        hasAccess: false,
        type: null,
        status: "unsubscribed",
        expiresAt: subscription.expiresAt,
        trialUsed: user?.trial_used || false,
    };
}
```

**The Problem:**
- If `expires_at` is in the past (even by 1 second), access is denied
- If payment succeeded but `expires_at` wasn't updated, user loses access
- No grace period or retry logic

---

### Critical Issue #4: Subscription Update vs Create Logic

**Location:** `backend/src/routes/payment.routes.ts` (line 480-503)

**Problem:**
The `/payment-success` endpoint ALWAYS creates a NEW subscription, even if one exists:

```typescript:480:503:backend/src/routes/payment.routes.ts
// 3. Сохраняем подписку в нашу базу данных
let subscription = await getSubscriptionByUserId(userId);
const currentDate = new Date();

// Если есть активная подписка (включая пробную), завершаем её
if (subscription && subscription.id && subscription.status === "active") {
    await updateSubscription(subscription.id, {
        status: "cancelled",
        expiresAt: currentDate,
        cancelledAt: currentDate,
    });
    console.log(`Previous subscription ${subscription.id} cancelled for user ${userId}`);
}

// ВСЕГДА создаем новую подписку для нового платежа (не обновляем старую)
subscription = await createSubscription({
    userId,
    planType: "premium",
    status: "active",
    // ...
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
```

**The Problem:**
- Cancels the existing active subscription
- Creates a brand new one
- If webhook runs later, it might update the OLD cancelled one instead of the new active one
- Results in user having access briefly, then losing it

---

## 🔄 How These Issues Compound

Here's a timeline of what can happen:

```
1. User completes payment
   └─> CloudPayments transaction succeeds

2. Frontend widget closes
   └─> Calls /payment-success
   └─> Finds existing trial subscription (status: active)
   └─> Cancels trial subscription
   └─> Creates NEW premium subscription (ID: sub-123, status: active, expires: +30 days)
   └─> User now has access ✅

3. CloudPayments webhook fires (2-5 seconds later)
   └─> Calls /notify
   └─> Calls getSubscriptionByUserId() 
   └─> Gets sub-123 (latest by created_at)
   └─> Tries to update sub-123
   └─> But something goes wrong (token missing, error, etc.)
   └─> OR creates ANOTHER subscription (sub-124)

4. User refreshes page
   └─> System calls getSubscriptionByUserId()
   └─> Gets sub-124 (latest) which might be:
       - status: cancelled
       - expires_at: NULL
       - expires_at: past date
   └─> hasAccess = false ❌
   └─> User denied access
```

---

## 📊 Scenarios That Cause Access Loss

### Scenario A: Status Not Updated
```sql
-- Subscription exists but status is wrong
status = 'cancelled' or 'unsubscribed'
expires_at = future date
-- Result: hasAccess = false (status check fails)
```

### Scenario B: Expiry Date Not Set
```sql
-- Subscription exists but expiry not set
status = 'active'
expires_at = NULL
-- Result: hasAccess = false (expires_at check fails)
```

### Scenario C: Expiry Date in Past
```sql
-- Subscription exists but already expired
status = 'active'
expires_at = '2024-01-01' (past date)
-- Result: hasAccess = false (expiry check fails)
```

### Scenario D: Wrong Subscription Retrieved
```sql
-- Multiple subscriptions, wrong one is latest
Subscription 1: id=sub-old, status='cancelled', created_at='2024-01-01'
Subscription 2: id=sub-active, status='active', created_at='2024-01-02', expires='2025-01-01'
Subscription 3: id=sub-webhook, status='cancelled', created_at='2024-01-02T00:00:05'

-- Query returns: sub-webhook (latest by milliseconds)
-- Result: hasAccess = false (status check fails)
```

---

## ✅ The Fix Script Solution

The `fix-user-subscription.ts` script addresses all these scenarios by:

1. **Finding all subscriptions** (not just latest)
2. **Finding all payments** to verify successful transactions
3. **Identifying the correct subscription** based on payment records
4. **Fixing the issue**:
   - Activating cancelled subscriptions
   - Extending expired dates
   - Making the correct subscription the latest
   - Creating missing subscriptions
5. **Verifying the fix** worked

---

## 🛡️ Recommended Long-Term Fixes

### Fix #1: Use Only Webhook for Subscription Creation
```typescript
// REMOVE subscription logic from /payment-success
// Keep ONLY the webhook /notify for creating/updating subscriptions
// Use /payment-success only for immediate UI feedback
```

### Fix #2: Add Idempotency Keys
```typescript
// Check for existing payment before processing
const existingPayment = await getPaymentByCloudPaymentsInvoiceId(InvoiceId);
if (existingPayment) {
    return res.json({ code: 0, message: 'Already processed' });
}
```

### Fix #3: Better Subscription Query
```typescript
// Instead of just latest, get the ACTIVE one with furthest expiry
const result = await pool.query(
    `SELECT * FROM subscriptions 
     WHERE user_id = $1 
     AND status = 'active'
     AND expires_at > NOW()
     ORDER BY expires_at DESC 
     LIMIT 1`,
    [userId]
);
```

### Fix #4: Add Transaction Locking
```typescript
// Prevent race conditions with database locks
await pool.query('BEGIN');
await pool.query('SELECT * FROM subscriptions WHERE user_id = $1 FOR UPDATE', [userId]);
// ... update logic ...
await pool.query('COMMIT');
```

### Fix #5: Add Retry Logic
```typescript
// If CloudPayments API call fails, retry with exponential backoff
// Don't fail the whole transaction if external API is down
```

---

## 📝 Summary

The subscription access issue is caused by a combination of:
- Race conditions between frontend and webhook
- Incorrect subscription retrieval logic
- Lack of idempotency in payment processing
- No transaction isolation

**Immediate Solution:** Use `fix-user-subscription.ts` to restore access

**Long-Term Solution:** Refactor payment flow to use only webhooks and add proper locking mechanisms

---

## 📞 Questions?

If you need clarification on any of these issues, check the specific files mentioned or contact the development team.


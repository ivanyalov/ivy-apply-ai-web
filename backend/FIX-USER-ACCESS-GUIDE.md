# 🔧 Fix User Subscription Access - Production Guide

## Problem
A user paid for subscription successfully, but doesn't have access to the service.

## Solution
Run the automated fix script that will diagnose and repair the subscription.

---

## 📋 Prerequisites

1. You have SSH access to your production server
2. You have the affected user's ID
3. You have access to run Node.js/TypeScript commands on the server

---

## 🚀 Quick Start

### Step 1: SSH into your server

```bash
ssh your-user@your-production-server
```

### Step 2: Navigate to the backend directory

```bash
cd /path/to/ivy-apply-ai-web-12/backend
```

### Step 3: Run the fix script with the user's ID

```bash
npx ts-node fix-user-subscription.ts USER_ID_HERE
```

**Example:**
```bash
npx ts-node fix-user-subscription.ts abc-123-def-456
```

### Step 4: Verify the output

The script will:
- ✅ Display all subscriptions and payments for the user
- ✅ Identify the specific issue
- ✅ Automatically apply the fix
- ✅ Verify that the fix worked

**Expected successful output:**
```
🎉 SUCCESS! User now has access to the service!
The user can log in and use the chat feature.
```

### Step 5: Ask the user to refresh and try again

The user should:
1. Refresh their browser (or log out and log back in)
2. Try accessing the chat feature
3. Confirm they now have access

---

## 📊 What the Script Does

The script automatically handles these scenarios:

### Scenario A: Subscription status is wrong
- **Issue**: Subscription marked as 'cancelled' or 'unsubscribed' but payment succeeded
- **Fix**: Changes status to 'active' and extends expiry date

### Scenario B: Subscription expired despite payment
- **Issue**: Subscription is 'active' but `expires_at` date is in the past
- **Fix**: Extends `expires_at` by 30 days from now

### Scenario C: Multiple subscriptions (wrong one is latest)
- **Issue**: User has multiple subscriptions, wrong one is being checked
- **Fix**: Makes the correct paid subscription the latest one, cancels others

### Scenario D: No subscription record exists
- **Issue**: Payment succeeded but no subscription was created
- **Fix**: Creates a new subscription from the payment record

---

## 🔍 Troubleshooting

### If the script shows "User still doesn't have access"

1. Check the output for the subscription details
2. Manually verify in the database:

```bash
# Connect to your database
psql $DATABASE_URL

# Run this query (replace USER_ID_HERE):
SELECT 
    id,
    status,
    plan_type,
    expires_at,
    CASE 
        WHEN status = 'active' AND expires_at > NOW() 
        THEN '✅ HAS ACCESS' 
        ELSE '❌ NO ACCESS' 
    END as access_check
FROM subscriptions 
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC 
LIMIT 1;
```

### If you get "No subscriptions found"

The script will:
- Check for payment records
- Create a subscription from the most recent successful payment
- If no payments exist, it means the payment webhook never fired

### If you need to check user ID

```bash
# Connect to database
psql $DATABASE_URL

# Find user by email
SELECT id, email, trial_used FROM users WHERE email = 'user@example.com';
```

---

## 🛡️ Safety

This script is **safe to run** because it:
- ✅ Only reads and updates subscription data
- ✅ Never deletes any data
- ✅ Only affects the specified user
- ✅ Shows all changes before and after
- ✅ Can be run multiple times safely (idempotent)

---

## 📝 After Running the Script

### Document the incident:
1. Note which user was affected (email/ID)
2. Note which scenario was identified
3. Save the script output for reference
4. Check if other users might have the same issue

### Monitor for similar issues:
```bash
# Check for other users with potential access issues
cd /path/to/ivy-apply-ai-web-12/backend

# Run this to find users with expired active subscriptions
npx ts-node update-expired-subscriptions.ts
```

---

## 🔄 Related Scripts

- `update-expired-subscriptions.ts` - Batch update all expired subscriptions
- `debug-users.ts` - Get detailed info about a specific user
- `user-stats.ts` - View statistics about all users and subscriptions

---

## 📞 Need Help?

If the script doesn't resolve the issue:
1. Save the complete output from the script
2. Check the application logs for errors
3. Verify CloudPayments webhook is working
4. Contact the development team with the user ID and script output

---

## ✅ Success Criteria

The fix is successful when:
- ✅ Script shows "SUCCESS! User now has access"
- ✅ User can log in and access the chat feature
- ✅ Subscription shows `status = 'active'` and `expires_at > NOW()`


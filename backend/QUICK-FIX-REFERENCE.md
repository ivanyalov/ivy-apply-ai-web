# ⚡ QUICK FIX REFERENCE

## One-Line Command to Fix User Access

```bash
cd /path/to/backend && npx ts-node fix-user-subscription.ts USER_ID_HERE
```

---

## Real World Example

```bash
# 1. SSH to server
ssh root@your-server.com

# 2. Go to backend
cd /var/www/ivy-apply-ai-web-12/backend

# 3. Run fix (replace with actual user ID)
npx ts-node fix-user-subscription.ts e3b0c442-98fc-1c14-b39f-92d1282e0f76

# 4. Done! ✅
```

---

## Get User ID by Email

```bash
psql $DATABASE_URL -c "SELECT id, email FROM users WHERE email = 'user@example.com';"
```

---

## Verify Fix Worked

```bash
psql $DATABASE_URL -c "SELECT id, status, expires_at FROM subscriptions WHERE user_id = 'USER_ID_HERE' ORDER BY created_at DESC LIMIT 1;"
```

---

## Common Issues & Fixes

| Issue | Command |
|-------|---------|
| Wrong user ID | `psql $DATABASE_URL -c "SELECT id, email FROM users LIMIT 10;"` |
| Script not found | `cd /path/to/backend && ls fix-user-subscription.ts` |
| Permission denied | `chmod +x fix-user-subscription.ts` |
| Database connection error | Check `DATABASE_URL` env variable |

---

## Full Documentation

See `FIX-USER-ACCESS-GUIDE.md` for complete documentation.


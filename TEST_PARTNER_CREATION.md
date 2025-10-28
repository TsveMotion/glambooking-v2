# 🧪 Test Partner Creation - Step by Step

## Current Setup

✅ **Brevo API Key Configured**: `BREVO_API_KEY` in `.env.local`
✅ **Email Fallback**: If Clerk fails, Brevo sends email automatically
✅ **Error Handling**: System logs all errors for debugging

---

## Complete Test Flow

### Step 1: Create White-Label Partner

1. **Visit admin:**
   ```
   http://localhost:3000/admin
   ```

2. **Click "White-Label"** in sidebar

3. **Click "Create White-Label"**

4. **Fill in form:**
   ```
   Business Name: Test Beauty Salon
   Owner First Name: Test
   Owner Last Name: Owner
   Email: YOUR_REAL_EMAIL@gmail.com  (use real email!)
   
   Subdomain: testbeauty
   Brand Name: Test Beauty
   Primary Color: #FF1493
   Secondary Color: #FFD700
   Accent Color: #333333
   
   Platform Fee: 1.0
   Monthly Fee: 200
   ```

5. **Click "Create White-Label"**

---

### Step 2: Check Console Logs

Open browser console (F12) and terminal to see:

```
Creating Clerk user for: test@test.com
Clerk user created: user_xxxxx
Clerk invitation sent: inv_xxxxx

OR (if Clerk fails):

Error creating Clerk user: [error details]
Using temporary Clerk ID: temp_xxxxx
Sending welcome email via Brevo to: test@test.com
Email sent successfully via Brevo: msg_xxxxx
```

---

### Step 3: Check Email Inbox

**If Clerk worked:**
- Look for email from: "Clerk" or "GlamBooking"
- Subject: "You've been invited to join GlamBooking"
- Click link → Set password

**If Brevo sent email:**
- Look for email from: "GlamBooking"
- Subject: "🎉 Welcome to Test Beauty - Your Platform is Ready!"
- Click "Login to Dashboard" button
- Create account via Clerk sign-up

---

### Step 4: Set Up Hosts File

```
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

Add this line:
127.0.0.1 testbeauty.localhost
```

---

### Step 5: Login

**Visit:**
```
http://testbeauty.localhost:3000/sign-in
```

**If you got Clerk invitation:**
- Use email + password you set

**If you got Brevo email:**
- Click "Sign up" first
- Create account with same email
- Then login

---

### Step 6: Access Dashboard

After login, visit:
```
http://testbeauty.localhost:3000/business/dashboard
```

**You should see:**
- ✅ Custom colors (pink/gold)
- ✅ "Test Beauty" branding
- ✅ Your business dashboard
- ✅ Can add services, staff, etc.

---

## Troubleshooting

### No Email Received

**Check 1: Console Logs**
```
Terminal logs should show:
"Email sent successfully via Brevo: msg_xxxxx"

If not, check:
- BREVO_API_KEY is set in .env.local
- API key is valid
- Email address is valid
```

**Check 2: Spam Folder**
- Check spam/junk folder
- Add noreply@glambooking.co.uk to contacts

**Check 3: Brevo Dashboard**
```
Visit: https://app.brevo.com
Login → Campaigns → Transactional
See if email was sent
```

### Clerk User Not Created

**This is OK!** System has fallback:
- Creates temp user in database
- Sends email via Brevo instead
- Partner can still sign up manually

**To manually create Clerk user:**
```
1. Go to: https://dashboard.clerk.com
2. Users → Create user
3. Enter email: test@test.com
4. Name: Test Owner
5. Send invitation
```

### Can't Login

**Check:**
1. User exists in Clerk dashboard
2. Email is verified
3. Password is set
4. Business exists in database

**Reset:**
```sql
-- Check if user exists
SELECT * FROM "User" WHERE email = 'test@test.com';

-- Check if business exists
SELECT * FROM "Business" WHERE email = 'test@test.com';

-- Check white-label config
SELECT * FROM "WhiteLabelConfig" WHERE subdomain = 'testbeauty';
```

### Dashboard Shows "Business Not Found"

**Fix:**
```
1. Check user.clerkId matches Clerk user ID
2. Check business.ownerId matches user.id
3. Restart dev server
4. Clear browser cache
```

---

## What Should Work

### ✅ Automatic Features

When you create a partner:

1. **Clerk User** (if Clerk works):
   - User created in Clerk
   - Invitation email sent
   - Partner sets password
   - Can login immediately

2. **Email Fallback** (if Clerk fails):
   - User created in database
   - Welcome email sent via Brevo
   - Partner clicks login link
   - Signs up manually
   - Links to existing business

3. **Business Setup**:
   - Business created
   - White-label config saved
   - Stripe customer created
   - Subscription started (£200/month)

4. **Branding**:
   - Custom colors applied
   - Logo saved (if provided)
   - Subdomain configured
   - Custom domain ready (if provided)

---

## Manual Workaround (If All Fails)

### If emails don't work at all:

1. **Create partner in admin** (as normal)

2. **Get login details from response:**
   ```json
   {
     "loginUrl": "http://testbeauty.localhost:3000/sign-in",
     "invitation": {
       "sent": false,
       "email": "test@test.com"
     }
   }
   ```

3. **Manually create Clerk user:**
   - Go to Clerk dashboard
   - Create user with email
   - Send invitation

4. **Or: Partner signs up manually:**
   - Visit: `http://testbeauty.localhost:3000/sign-up`
   - Create account with same email
   - System links to business automatically

---

## Environment Variables Required

Make sure these are set in `.env.local`:

```env
# Brevo Email
BREVO_API_KEY=xkeysib-3d755316462cea7ad7d95fd72305f0bdea99f3a802f3fee81b049a8a0df0af07

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database
POSTGRES_URL_NON_POOLING=postgresql://...
```

---

## Expected Console Output

```bash
# Creating partner
Creating Clerk user for: test@test.com

# If Clerk succeeds
Clerk user created: user_2abc123xyz
Clerk invitation sent: inv_2def456uvw
Database user created: clxabc123

# If Clerk fails
Error creating Clerk user: [error details]
Using temporary Clerk ID: temp_1730000000_abc123
Database user created: clxabc123
Sending welcome email via Brevo to: test@test.com
Email sent successfully via Brevo: <msg_id>

# Business creation
Stripe customer created: cus_abc123xyz
Subscription created: sub_abc123xyz
White-label business created successfully

# Response
{
  "success": true,
  "businessId": "clxabc123",
  "invitation": {
    "sent": true,
    "method": "brevo",
    "email": "test@test.com"
  }
}
```

---

## Next Steps After Successful Creation

1. ✅ Partner receives email
2. ✅ Partner sets password (Clerk) or signs up (manual)
3. ✅ Partner logs in
4. ✅ Partner sees custom branded dashboard
5. ✅ Partner adds services
6. ✅ Partner adds staff
7. ✅ Customers book on custom domain
8. ✅ Revenue flows automatically

---

## Success Checklist

- [ ] Partner created in admin
- [ ] Email sent (check inbox/spam)
- [ ] Clerk user created (or temp ID used)
- [ ] Database user created
- [ ] Business created
- [ ] White-label config saved
- [ ] Stripe subscription created
- [ ] Can login with credentials
- [ ] Dashboard shows custom branding
- [ ] Can add services/staff
- [ ] Booking page works

---

## Still Not Working?

**Check terminal logs for specific errors:**

```bash
# Look for these lines:
ERROR: Failed to create Clerk user
ERROR: Failed to send email via Brevo
ERROR: BREVO_API_KEY not set
ERROR: Invalid email address
```

**Common issues:**
1. BREVO_API_KEY not set or invalid
2. Clerk credentials missing
3. Database connection issue
4. Invalid email format
5. Clerk rate limits exceeded

**Quick fixes:**
- Restart dev server: `npm run dev`
- Regenerate Prisma: `npx prisma generate`
- Check .env.local has all keys
- Test Brevo key: https://app.brevo.com/settings/keys/api

---

Your white-label system is ready! Try creating a partner now. 🚀

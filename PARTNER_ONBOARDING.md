# 🎯 White-Label Partner Onboarding Guide

## Complete Partner Setup Flow

### For You (Platform Admin)

#### Step 1: Create White-Label Partner

1. Login to admin: `http://localhost:3000/admin`
2. Click **"White-Label"** in sidebar
3. Click **"Create White-Label"**
4. Fill in wizard:

```
Business Info:
- Business Name: Elegant Beauty Salon
- Owner First Name: Sarah
- Owner Last Name: Johnson
- Email: sarah@elegantbeauty.com

Domain:
- Subdomain: elegantbeauty
  (Creates: elegantbeauty.glambooking.com)

Branding:
- Brand Name: Elegant Beauty
- Primary Color: #FF1493
- Secondary Color: #FFD700
- Accent Color: #333333

Pricing:
- Platform Fee: 1.0%
- Monthly Fee: £200.00
```

5. Click **"Create White-Label"**

#### Step 2: System Automatically Does:

✅ Creates Clerk user account
✅ Sends invitation email to partner
✅ Creates business in database
✅ Sets up white-label configuration
✅ Creates Stripe customer
✅ Sets up £200/month subscription
✅ Creates owner as staff member

---

### For Partner (Business Owner)

#### Step 1: Receive Invitation Email

Partner receives email from Clerk:
```
Subject: You've been invited to join GlamBooking

Click here to set your password and get started
```

#### Step 2: Set Password

1. Click link in email
2. Create password
3. Completes Clerk signup

#### Step 3: Login to Dashboard

**Option A: Via Subdomain**
```
https://elegantbeauty.glambooking.com/business/dashboard
```

**Option B: Via Custom Domain** (after DNS setup)
```
https://elegantbeauty.com/business/dashboard
```

**Option C: Via Main Domain**
```
https://glambooking.com/business/dashboard
```

All URLs work! They'll see their business automatically.

#### Step 4: Partner Can Now:

✅ Manage services (add/edit/delete)
✅ Manage staff members
✅ View bookings
✅ See analytics
✅ Configure business settings
✅ Everything works with custom branding!

---

## Authentication Flow

### How It Works:

```
1. Partner visits: elegantbeauty.glambooking.com
2. Clicks "Login" or goes to /business/dashboard
3. Redirected to Clerk login
4. Logs in with email + password
5. Clerk creates session
6. Redirected back to /business/dashboard
7. System finds business by user's email
8. Shows their dashboard with custom branding
```

### Clerk Configuration:

Your Clerk app needs:
- ✅ Email/password authentication enabled
- ✅ Invitations enabled
- ✅ Social login (optional)

### Domain Configuration:

Clerk works across all domains automatically:
- `localhost:3000` ✅
- `test.localhost:3000` ✅
- `glambooking.com` ✅
- `partner.glambooking.com` ✅
- `partner.com` ✅ (custom domain)

---

## Complete User Journey

### 1. Admin Creates Partner

```
Admin Panel → White-Label → Create
↓
System creates:
- Clerk user
- Database user  
- Business
- White-label config
- Stripe customer
- Subscription
↓
Invitation email sent
```

### 2. Partner Receives Email

```
Inbox: "Invitation to GlamBooking"
↓
Click: Set password link
↓
Creates password
↓
Account activated
```

### 3. Partner Logs In

```
Visit: elegantbeauty.glambooking.com
↓
Click: Login button
↓
Enter: email + password
↓
Clerk authenticates
↓
Redirect: /business/dashboard
```

### 4. Partner Manages Business

```
Dashboard loads
↓
Shows: Custom branding (colors, logo)
↓
Partner can:
- Add services
- Add staff
- View bookings
- Manage everything
```

### 5. Customers Book

```
Customer visits: elegantbeauty.glambooking.com
↓
Sees: Custom branded booking page
↓
Books: Service with staff
↓
Pays: Via Stripe
↓
Partner gets: 98.5% (1% to you, 1.5% Stripe)
You get: 1% + £200/month
```

---

## Login URLs

Partner can login from any of these URLs:

### Production:

```
Main domain:
https://glambooking.com/sign-in

Subdomain:
https://elegantbeauty.glambooking.com/sign-in

Custom domain:
https://elegantbeauty.com/sign-in

Direct to dashboard:
https://elegantbeauty.glambooking.com/business/dashboard
(Redirects to login if not authenticated)
```

### Local Development:

```
Main:
http://localhost:3000/sign-in

Subdomain:
http://elegantbeauty.localhost:3000/sign-in

Dashboard:
http://elegantbeauty.localhost:3000/business/dashboard
```

---

## Partner Onboarding Checklist

Send this to your partners:

### Welcome Email Template:

```
Subject: Welcome to Your White-Label Booking Platform! 🎉

Hi Sarah,

Your custom booking platform is ready! Here's what to do next:

1️⃣ SET UP YOUR ACCOUNT
   - Check your email for Clerk invitation
   - Click the link to set your password
   - This takes 30 seconds

2️⃣ LOGIN TO YOUR DASHBOARD
   - Visit: https://elegantbeauty.glambooking.com/business/dashboard
   - Or visit: https://elegantbeauty.com/business/dashboard (after DNS setup)
   - Login with your email and new password

3️⃣ ADD YOUR SERVICES
   - Click "Add Service"
   - Enter service name, duration, price
   - Upload service images (optional)

4️⃣ ADD YOUR TEAM
   - Click "Staff" → "Add Staff Member"
   - Enter their details
   - They'll receive their own login

5️⃣ START TAKING BOOKINGS!
   - Share your booking page with customers
   - URL: https://elegantbeauty.glambooking.com
   - Start accepting bookings immediately

CUSTOM DOMAIN (Optional):
Want to use elegantbeauty.com instead?
1. Add DNS CNAME: @ → cname.vercel-dns.com
2. Wait 24-48 hours for DNS propagation
3. Done! Your site works on your domain

NEED HELP?
Reply to this email anytime!

Your Platform Fee: 1% per booking
Monthly Subscription: £200
Billed via Stripe automatically

Welcome aboard! 🚀
The GlamBooking Team
```

---

## Testing Locally

### Quick Test:

1. **Create partner:**
   ```
   http://localhost:3000/admin/whitelabel/create
   Email: test@test.com
   Subdomain: test
   ```

2. **Check email** (if using real email)
   - Or check Clerk dashboard for invitation

3. **Set password:**
   - Click invitation link
   - Create password

4. **Add to hosts file:**
   ```
   127.0.0.1 test.localhost
   ```

5. **Login:**
   ```
   http://test.localhost:3000/sign-in
   Email: test@test.com
   Password: [your password]
   ```

6. **Access dashboard:**
   ```
   http://test.localhost:3000/business/dashboard
   ```

7. **Verify:**
   - ✅ Custom branding shows
   - ✅ Can add services
   - ✅ Can add staff
   - ✅ Can view bookings

---

## Troubleshooting

### Partner can't login

**Issue:** "User not found"
- Check Clerk dashboard: User created?
- Check invitation was sent
- Resend invitation if needed

### Dashboard shows 404

**Issue:** Business not found
- Check database: Business exists?
- Check ownerId matches Clerk user ID
- Check business.isActive = true

### Wrong branding

**Issue:** Shows default colors
- Check subdomain spelling
- Check middleware detects domain
- Clear browser cache

### Can't access /business/dashboard

**Issue:** Redirects to onboarding
- Check user owns a business
- Check business exists in database
- Check API returns business data

---

## Production Deployment

### Before Going Live:

1. **Clerk Setup:**
   - Enable email/password auth
   - Enable invitations
   - Configure email templates
   - Add production domain

2. **Email Configuration:**
   - Set up transactional email (SendGrid, etc.)
   - Configure welcome email template
   - Test invitation emails

3. **Domain Setup:**
   - Add `*.glambooking.com` to hosting
   - Configure SSL
   - Test subdomain routing

4. **Stripe Setup:**
   - Switch to live keys
   - Create subscription product
   - Set up webhooks

### Partner Onboarding Process:

1. Admin creates partner
2. System sends invitation
3. Partner sets password
4. Partner logs in
5. Partner manages business
6. Customers book services
7. Revenue flows automatically

---

## Security Notes

### User Isolation:

- Partners only see THEIR business
- Can't access other partners' data
- Authentication via Clerk (secure)
- Sessions work across subdomains

### Access Control:

- `/business/*` requires authentication
- User must own the business
- Staff can only access their business
- Admin can access everything

### Data Privacy:

- Each partner's data is isolated
- Bookings only visible to partner
- Customer data protected
- GDPR compliant

---

## Summary

**For You (Admin):**
1. Create partner in admin panel
2. System handles everything automatically
3. Partner receives invitation email
4. Done!

**For Partner:**
1. Check email for invitation
2. Set password
3. Login to dashboard
4. Manage business
5. Accept bookings

**For Customers:**
1. Visit partner's domain
2. See custom branding
3. Book service
4. Pay securely
5. Everyone happy! 🎉

---

Your white-label platform is ready for partners! 🚀

# 🏷️ White-Label System - Complete Guide

## Overview

Your GlamBooking platform now supports white-label partners who can have their own branded booking system on custom domains/subdomains. You charge them **£200/month** subscription + **1%** of every booking transaction.

## 💰 Revenue Model

- **Standard Businesses**: Pay 5% platform fee per booking (includes Stripe costs)
- **White-Label Partners**: Pay £200/month + 1% platform fee per booking
  - Partner absorbs Stripe fees (~1.5%)
  - Partner keeps 98.5% of booking revenue
  - You get stable recurring revenue + transaction fees

**Example Revenue:**
- 50 white-label partners = **£10,000/month** base
- Each partner processes £10,000/month in bookings = **£5,000/month** transaction fees
- **Total: £15,000/month** from white-label alone!

---

## 🚀 How to Create a White-Label Partner

### Step 1: Access Admin Dashboard

1. Go to `http://localhost:3000/admin` (or your production domain)
2. Login with your admin account (kristiyan@tsvweb.com)
3. Click **"White-Label"** in the sidebar

### Step 2: Create New White-Label

Click **"Create White-Label"** button and follow the 4-step wizard:

#### **Step 1: Business Information**
```
Business Name: Elegant Beauty Salon
Owner First Name: Sarah
Owner Last Name: Johnson
Email: sarah@elegantbeauty.com
```

#### **Step 2: Domain Configuration**

**Option A: Subdomain (Easiest)**
```
Subdomain: elegantbeauty
Results in: elegantbeauty.glambooking.com
```

**Option B: Custom Domain (Requires DNS Setup)**
```
Custom Domain: elegantbeauty.com
Partner must configure DNS:
  - CNAME record: @ → your-glambooking-domain.vercel.app
  - Or A record pointing to your server IP
```

#### **Step 3: Branding**
```
Brand Name: Elegant Beauty
Primary Color: #FF1493 (pink)
Secondary Color: #FFD700 (gold)
Accent Color: #333333 (dark gray)
Logo URL: https://elegantbeauty.com/logo.png (optional)
```

#### **Step 4: Pricing**
```
Platform Fee: 1.0% (default, adjustable)
Monthly Fee: £200.00 (default, adjustable)
```

Click **"Create White-Label"** ✅

---

## 🎨 How It Works

### Domain Routing

1. **Subdomain**: `elegantbeauty.glambooking.com`
   - Automatically works if your app is on Vercel/Netlify
   - Middleware detects subdomain and loads branding

2. **Custom Domain**: `elegantbeauty.com`
   - Partner configures DNS CNAME → your domain
   - Middleware detects domain and loads branding

### Branding Application

When a user visits a white-label domain:

1. **Middleware** (`middleware.ts`):
   - Detects domain/subdomain
   - Queries database for white-label config
   - Injects branding into request headers

2. **Pages** use `WhiteLabelBranding` component:
   - Reads branding from headers
   - Applies custom colors to entire UI
   - Changes logo and brand name

3. **CSS Variables** override:
   ```css
   .bg-glam-pink → uses white-label primary color
   .text-glam-pink → uses white-label primary color
   .glam-gradient → uses white-label colors
   ```

---

## 📊 Managing White-Label Partners

### View All Partners

Navigate to `/admin/whitelabel` to see:
- Total partners count
- Monthly recurring revenue (£200 × active partners)
- Transaction revenue (1% fees)
- Total bookings across all partners

### Partner Details

Click **"View"** on any partner to see:
- Booking statistics
- Revenue metrics
- Domain configuration
- Branding settings

### Edit Partner

Click **"Settings"** to modify:
- Domain configuration
- Branding colors/logo
- Fee percentage
- Monthly subscription amount
- Active/Inactive status

---

## 💳 Billing Setup (Next Phase)

To automatically charge £200/month:

### 1. Create Stripe Products

```bash
# Create White-Label subscription product
stripe products create \
  --name "White-Label Platform Access" \
  --description "Monthly subscription for white-label booking platform"

# Create price
stripe prices create \
  --product prod_xxx \
  --unit-amount 20000 \
  --currency gbp \
  --recurring-interval month
```

### 2. Update Creation Flow

In `create/route.ts`, add after business creation:

```typescript
// Create Stripe subscription
const subscription = await stripe.subscriptions.create({
  customer: stripeCustomerId,
  items: [{ price: 'price_xxx' }], // Your white-label price ID
  metadata: {
    businessId: business.id,
    type: 'whitelabel'
  }
})

// Update white-label config with subscription ID
await prisma.whiteLabelConfig.update({
  where: { id: whitelabelConfig.id },
  data: {
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    nextBillingDate: new Date(subscription.current_period_end * 1000)
  }
})
```

### 3. Handle Subscription Webhooks

Add to `app/api/webhooks/stripe/route.ts`:

```typescript
case 'invoice.payment_failed':
  // Suspend white-label if payment fails
  await prisma.whiteLabelConfig.update({
    where: { stripeSubscriptionId: event.data.object.subscription },
    data: { 
      isActive: false,
      subscriptionStatus: 'past_due' 
    }
  })
  break

case 'invoice.payment_succeeded':
  // Reactivate white-label on successful payment
  await prisma.whiteLabelConfig.update({
    where: { stripeSubscriptionId: event.data.object.subscription },
    data: { 
      isActive: true,
      subscriptionStatus: 'active',
      nextBillingDate: new Date(event.data.object.period_end * 1000)
    }
  })
  break
```

---

## 🧪 Testing White-Label

### Local Testing with Subdomain

1. Edit your `/etc/hosts` file (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
   ```
   127.0.0.1 elegantbeauty.localhost
   ```

2. Create a white-label with subdomain: `elegantbeauty`

3. Visit `http://elegantbeauty.localhost:3000`
   - Should show custom branding!
   - Colors should match what you configured
   - Brand name should appear in header

### Production Testing

1. Deploy your app to Vercel/Netlify
2. Create white-label with subdomain
3. Visit `https://elegantbeauty.glambooking.com`

### Custom Domain Testing

1. Partner adds DNS record:
   ```
   CNAME @ → your-app.vercel.app
   ```

2. In Vercel, add custom domain to your project
3. Create white-label with custom domain
4. Visit `https://elegantbeauty.com`

---

## 📱 Partner Experience

### What Partners Get:

1. **Full Booking System**
   - Their own branded dashboard
   - Customer booking pages
   - Staff management
   - Service management
   - Analytics and reports

2. **Custom Domain**
   - Can use their own domain (elegantbeauty.com)
   - Or use subdomain (elegantbeauty.glambooking.com)

3. **Custom Branding**
   - Their colors throughout the app
   - Their logo on all pages
   - Their business name

4. **Lower Fees**
   - Only 1% platform fee (vs 5% for standard)
   - They absorb Stripe fees
   - Keep 98.5% of revenue

### What Partners DON'T Get:

- Source code access
- Database access
- Ability to host independently
- You maintain and update the platform

---

## 🔧 Technical Implementation

### File Structure

```
app/
├── admin/
│   └── whitelabel/
│       ├── page.tsx              # List all partners
│       ├── create/
│       │   └── page.tsx          # 4-step creation wizard
│       └── [id]/
│           ├── page.tsx          # Partner details
│           └── settings/
│               └── page.tsx      # Edit partner
├── api/
│   └── admin/
│       └── whitelabel/
│           ├── route.ts          # GET all partners
│           └── create/
│               └── route.ts      # POST create partner
├── components/
│   └── whitelabel-branding.tsx   # Branding component
├── lib/
│   └── whitelabel.ts             # Helper functions
├── prisma/
│   └── schema.prisma             # Database schema
└── middleware.ts                  # Domain routing + branding injection
```

### Database Schema

```prisma
model Business {
  isWhiteLabel     Boolean @default(false)
  whitelabelConfig WhiteLabelConfig?
  // ... other fields
}

model WhiteLabelConfig {
  id                    String
  businessId            String @unique
  customDomain          String? @unique
  subdomain             String? @unique
  brandName             String?
  logoUrl               String?
  primaryColor          String
  secondaryColor        String
  accentColor           String
  platformFeePercentage Decimal @default(1.0)
  monthlyFee            Decimal @default(200.00)
  isActive              Boolean @default(true)
  stripeSubscriptionId  String?
  subscriptionStatus    String @default("active")
  nextBillingDate       DateTime?
  business              Business
}
```

---

## 🎯 Next Steps

### Phase 1: ✅ COMPLETE
- [x] Database schema
- [x] Admin dashboard
- [x] Creation wizard
- [x] Domain routing
- [x] Branding injection
- [x] Payment fee logic

### Phase 2: Stripe Billing (Recommended Next)
- [ ] Automated £200/month subscriptions
- [ ] Webhook handling for failed payments
- [ ] Grace period management
- [ ] Email notifications for billing issues

### Phase 3: Enhanced Features
- [ ] White-label analytics dashboard
- [ ] Custom email templates per partner
- [ ] Sub-user management for partners
- [ ] API access for partners
- [ ] Webhook endpoints for partners

### Phase 4: Marketing
- [ ] White-label landing page
- [ ] Partner signup form
- [ ] Pricing calculator
- [ ] Partner testimonials
- [ ] Demo environment

---

## 💡 Tips for Success

1. **Start Small**: Test with 1-2 partners before scaling
2. **Clear Documentation**: Provide DNS setup guides to partners
3. **Support System**: Have a support channel for partner questions
4. **Onboarding**: Create step-by-step onboarding for new partners
5. **Monitor Performance**: Track partner usage and revenue
6. **Regular Updates**: Keep all partners updated with platform improvements

---

## 🐛 Troubleshooting

### Domain Not Loading Custom Branding

1. Check DNS configuration is correct
2. Verify domain is added in Vercel/hosting settings
3. Check database for correct domain entry
4. Clear browser cache
5. Check middleware is running (console logs)

### Colors Not Applying

1. Verify `WhiteLabelBranding` component is imported
2. Check CSS specificity (may need `!important`)
3. Inspect element to see if CSS variables are set
4. Clear Next.js cache: `npm run build`

### Payment Fees Not Correct

1. Check `isWhiteLabel` flag is set to `true`
2. Verify `whitelabelConfig` exists for business
3. Check payment API routes are updated
4. Test with Stripe test mode first

---

## 📞 Support

For questions or issues:
- Check this documentation first
- Review code comments in key files
- Test in development before production
- Monitor Stripe dashboard for payment issues

**Key Files to Reference:**
- `middleware.ts` - Domain routing
- `lib/whitelabel.ts` - Helper functions
- `app/api/admin/whitelabel/create/route.ts` - Creation logic
- `prisma/schema.prisma` - Database structure

---

## 🎉 Success Metrics

Track these KPIs:
- **MRR**: Monthly Recurring Revenue (£200 × partners)
- **Transaction Revenue**: 1% of total bookings
- **Churn Rate**: Partners who cancel
- **ARPU**: Average Revenue Per User
- **LTV**: Lifetime Value of a partner

**Target Goals:**
- 10 partners = £2,000 MRR + transaction fees
- 50 partners = £10,000 MRR + transaction fees
- 100 partners = £20,000 MRR + transaction fees

---

Good luck with your white-label platform! 🚀

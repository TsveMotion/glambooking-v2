# Super Admin Portal Guide

## Overview

The Super Admin Portal is the **MAIN MAIN MAIN** administrative interface for the GlamBooking platform. This is where platform owners have complete control over:

- All whitelabel businesses
- Platform-wide analytics
- Revenue management
- Business approval/deactivation
- Global settings

## Access

### URL
```
http://admin.localhost:3000
```

This will automatically redirect to the super admin dashboard at `/super-admin`.

### Authentication
- Must be logged in with Clerk authentication
- TODO: Add super admin role verification

## Features

### 1. Overview Tab
**Platform Statistics:**
- Total Whitelabels (active/inactive count)
- Monthly Revenue (platform fees collected)
- Total Bookings (across all businesses)
- Total Revenue (all-time)
- Platform Users (all whitelabel users)
- Average Revenue per Partner

**Quick Actions:**
- Create Whitelabel
- View All Businesses
- Platform Analytics

**Recent Whitelabels:**
- Latest 5 businesses added
- Quick view links

### 2. Whitelabel Businesses Tab
**Business Management:**
- Search by name, subdomain, or brand
- View all whitelabel businesses in detail
- See per-business stats:
  - Platform fee percentage
  - Monthly subscription cost
  - Total bookings
  - Monthly revenue
  - Owner email
  - Active/Inactive status

**Actions per Business:**
- 👁️ View their public site
- ✏️ Edit their settings
- 🔴/🟢 Enable/Disable business

### 3. Platform Analytics Tab
- Detailed insights across all businesses
- Charts and metrics (coming soon)

### 4. Platform Settings Tab
- Global configuration options
- Settings that affect all whitelabel businesses

## Business Card Information

Each whitelabel business displays:
- Brand name and status badge
- Business name
- Subdomain (e.g., "test5")
- Creation date
- Owner email
- Platform fee percentage (what they pay YOU)
- Monthly subscription (what they pay YOU)
- Total bookings
- Monthly revenue (YOUR earnings from their platform)

## Workflow

### Creating a New Whitelabel
1. Click "Create Whitelabel" or "New Whitelabel"
2. Fill in business details
3. Set subdomain (e.g., "test5")
4. Configure branding
5. Set fees (what they pay YOU)

### Managing Existing Whitelabels
1. Go to "Whitelabel Businesses" tab
2. Search or browse businesses
3. Click actions:
   - View: See their public site
   - Edit: Manage their settings
   - Enable/Disable: Control access

### Monitoring Platform Revenue
1. Overview tab shows:
   - Monthly revenue (fees collected)
   - Total all-time revenue
   - Average revenue per partner
2. Each business card shows their contribution

## Technical Details

### API Endpoints
- `GET /api/super-admin/whitelabels` - List all whitelabel businesses
- `POST /api/super-admin/whitelabels/toggle-status` - Enable/disable business

### Middleware Routing
- `admin.localhost:3000` automatically routes to `/super-admin`
- Protected route requiring authentication
- TODO: Add role-based access control

### Business vs. Whitelabel Admin

**Super Admin (admin.localhost:3000):**
- Manages ALL whitelabel businesses
- Platform-wide control
- Revenue from ALL partners
- Enable/disable any business

**Whitelabel Admin (test5.localhost:3000/admin/[businessId]):**
- Manages THEIR whitelabel only
- Customer pricing configuration
- Their Stripe Connect
- Their users and businesses

## Revenue Model

### Platform Fees (What YOU Earn)
Each whitelabel pays you:
1. **Platform Fee Percentage**: X% of every booking
2. **Monthly Subscription**: £X/month

These are configured in the Branding tab of each whitelabel's admin portal.

### Example
- Whitelabel "SalonPro" has:
  - Platform fee: 1%
  - Monthly subscription: £200
  - Monthly bookings: £10,000

**YOUR Revenue from SalonPro:**
- Platform fees: £100 (1% of £10,000)
- Subscription: £200
- **Total: £300/month**

## Next Steps

1. Add super admin role verification
2. Implement approval workflow for new whitelabels
3. Add detailed analytics charts
4. Add global platform settings
5. Add user management across all platforms
6. Add email notifications for new signups
7. Add billing/invoicing for whitelabel fees

## Security Notes

- Currently any authenticated user can access super admin
- Need to implement role-based access control
- Consider adding 2FA for super admin access
- Audit log for all super admin actions

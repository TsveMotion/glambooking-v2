# Vercel Subdomain Setup Guide

This guide will help you set up the `admin.localhost:3000` subdomain for local development and configure it for production on Vercel.

## Local Development Setup

The super admin panel is accessible at `http://admin.localhost:3000/super-admin`

### How It Works

1. **Middleware Detection**: The middleware in `middleware.ts` detects when the hostname starts with `admin.localhost`
2. **Auto-redirect**: Any requests to `admin.localhost:3000` automatically redirect to `/super-admin`
3. **Authentication**: Only users with the email `kristiyan@tsvweb.com` can access this panel

### Testing Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Access the super admin panel:
   ```
   http://admin.localhost:3000/super-admin
   ```

3. Sign in with the authorized email: `kristiyan@tsvweb.com`

## Production Deployment on Vercel

### Step 1: Add Domain to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Add your main domain (e.g., `glambooking.com`)
4. Add the admin subdomain: `admin.glambooking.com`

### Step 2: Configure DNS

Add the following DNS records to your domain provider:

**For main domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For admin subdomain:**
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

### Step 3: Verify Domain

1. Wait for DNS propagation (can take up to 48 hours, usually much faster)
2. Vercel will automatically verify the domain
3. SSL certificates will be issued automatically

### Step 4: Update Environment Variables

Ensure your production environment variables are set in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add/verify:
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`

### Step 5: Test Production Access

Once deployed:
- Main site: `https://glambooking.com`
- Super Admin: `https://admin.glambooking.com/super-admin`
- White-label sites: `https://[subdomain].glambooking.com`

## Security Features

### Email-Based Authorization

Only the email `kristiyan@tsvweb.com` (configured in `lib/super-admin-auth.ts`) can access:
- The super admin dashboard
- Super admin API routes
- Administrative functions

### Domain Restrictions

The super admin panel is ONLY accessible from:
- `admin.localhost:3000` (local development)
- `admin.glambooking.com` (production)

Attempts to access `/super-admin` from any other domain will be redirected to the home page.

### API Route Protection

All super admin API routes use the `verifySuperAdmin()` function which:
1. Checks if user is authenticated via Clerk
2. Verifies the user's email matches the super admin email
3. Returns 403 Forbidden if unauthorized

## White-Label Subdomain Configuration

### For Partners

Each white-label business can have:
1. A subdomain: `[partner].glambooking.com`
2. A custom domain: `www.partnerdomain.com`

### Adding a White-Label Subdomain

1. Create white-label config in database with subdomain
2. Add the subdomain to Vercel domains
3. The middleware will automatically detect and route correctly

### Adding a Custom Domain for White-Label

1. Partner provides their domain
2. Add domain to Vercel project
3. Partner updates their DNS:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```
4. Update white-label config with custom domain
5. Middleware handles routing automatically

## Troubleshooting

### Issue: Can't access admin.localhost:3000

**Solution**: 
- Ensure development server is running
- Check that you're using `http://` not `https://`
- Clear browser cache and cookies
- Try incognito mode

### Issue: Getting 403 Forbidden

**Solution**:
- Verify you're signed in with `kristiyan@tsvweb.com`
- Check Clerk dashboard to confirm email
- Clear Clerk session and sign in again

### Issue: Subdomain not working on Vercel

**Solution**:
- Verify DNS records are correct
- Wait for DNS propagation (use `nslookup admin.glambooking.com`)
- Check Vercel domain settings
- Ensure domain is verified in Vercel

### Issue: Super admin accessible from wrong domain

**Solution**:
- Check middleware.ts for domain restrictions
- Verify deployment includes latest middleware changes
- Clear Vercel cache and redeploy

## File Structure

Key files for super admin functionality:

```
/app
  /super-admin
    page.tsx                          # Super admin dashboard UI
  /api
    /super-admin
      /stats/route.ts                 # Platform statistics
      /users/route.ts                 # User management
      /businesses/route.ts            # Business management
      /whitelabels/route.ts           # White-label management
      /activity/route.ts              # Activity feed
      /analytics/route.ts             # Analytics data
      /whitelabels/toggle-status/route.ts  # Toggle business status

/lib
  super-admin-auth.ts                 # Authorization utility

middleware.ts                         # Domain routing and protection
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify environment variables are set
4. Check Clerk user settings

For custom domain issues, contact Vercel support with your domain and project details.

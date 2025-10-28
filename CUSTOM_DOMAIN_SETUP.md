# 🌐 Custom Domain Setup Guide

Complete guide to setting up custom domains for white-label partners.

---

## 📋 Overview

White-label partners can use either:
1. **Subdomain** (Easy): `partner.glambooking.com` - Works instantly
2. **Custom Domain** (Advanced): `partner.com` - Requires DNS setup

---

## 🚀 Quick Setup Process

### Option 1: Subdomain (Recommended for Start)

**Advantages:**
- ✅ Works immediately
- ✅ No DNS configuration needed
- ✅ SSL automatic via your hosting
- ✅ Easy to manage

**How to Use:**
1. Create white-label partner with subdomain: `elegantbeauty`
2. Share URL: `https://elegantbeauty.glambooking.co.uk`
3. Done! It works instantly.

**Production Setup:**
- Deploy your app to Vercel/Netlify
- Subdomain routing works automatically
- No additional configuration needed

---

### Option 2: Custom Domain (Professional)

**Advantages:**
- ✅ Partner's own brand domain
- ✅ More professional
- ✅ Better SEO
- ✅ Customer trust

**Disadvantages:**
- ⚠️ Requires DNS configuration
- ⚠️ May take 24-48 hours to propagate
- ⚠️ Requires SSL certificate setup

---

## 🔧 Custom Domain Setup - Step by Step

### Step 1: Partner Provides Domain

Ask your white-label partner for their domain name:
- Example: `elegantbeauty.com`

### Step 2: Add Domain to Your Hosting

#### **For Vercel:**

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add the partner's domain:
   ```
   elegantbeauty.com
   ```
4. Vercel will provide DNS instructions

#### **For Netlify:**

1. Go to Netlify Dashboard → Your Site
2. Click **"Domain management"** → **"Add custom domain"**
3. Add the partner's domain:
   ```
   elegantbeauty.com
   ```
4. Netlify will provide DNS instructions

### Step 3: Partner Configures DNS

Partner needs to add DNS records at their domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

#### **Option A: CNAME Record (Recommended)**

```
Type: CNAME
Name: @ (or leave blank for root domain)
Value: cname.vercel-dns.com (or your hosting CNAME)
TTL: 3600 (1 hour)
```

For subdomain (e.g., `booking.elegantbeauty.com`):
```
Type: CNAME
Name: booking
Value: cname.vercel-dns.com
TTL: 3600
```

#### **Option B: A Record**

```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21 (Vercel's IP, check their docs)
TTL: 3600
```

**Note:** Get the exact DNS values from your hosting provider (Vercel/Netlify).

### Step 4: Wait for DNS Propagation

- Usually takes: 5-30 minutes
- Can take up to: 24-48 hours
- Check status: https://dnschecker.org

### Step 5: SSL Certificate

#### **Vercel/Netlify:**
- SSL certificates are **automatic**
- Provided free via Let's Encrypt
- Takes 5-10 minutes after DNS propagates

#### **Custom Hosting:**
```bash
# Using Certbot
sudo certbot --nginx -d elegantbeauty.com
```

### Step 6: Create White-Label in Admin

1. Go to `/admin/whitelabel`
2. Click "Create White-Label"
3. Fill in wizard:
   ```
   Domain Configuration:
   - Choose: "Custom Domain"
   - Enter: elegantbeauty.com
   ```
4. Create partner

### Step 7: Test

Visit: `https://elegantbeauty.com`
- Should show partner's custom branding
- Should have SSL (🔒 in browser)
- Should apply 1% fee

---

## 🔍 DNS Configuration Examples

### Cloudflare Setup

1. Login to Cloudflare
2. Select domain
3. Go to **DNS** tab
4. Add CNAME record:
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud)
   ```
5. Save

**Important:** Turn OFF Cloudflare proxy (gray cloud) initially to verify setup.

### GoDaddy Setup

1. Login to GoDaddy
2. My Products → Domain → DNS
3. Add record:
   ```
   Type: CNAME
   Host: @
   Points to: cname.vercel-dns.com
   TTL: 600 seconds
   ```
4. Save

### Namecheap Setup

1. Login to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add New Record:
   ```
   Type: CNAME Record
   Host: @
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```
4. Save

---

## 🐛 Troubleshooting

### Issue: Domain not resolving

**Check:**
```bash
# Check DNS propagation
nslookup elegantbeauty.com

# Check CNAME
dig elegantbeauty.com CNAME

# Check from different locations
https://dnschecker.org
```

**Fix:**
- Wait 24-48 hours for full propagation
- Verify CNAME record is correct
- Check no conflicting A records exist
- Ensure proxy/CDN is disabled initially

### Issue: SSL certificate not working

**Check:**
- DNS is fully propagated
- Domain is added to hosting provider
- Certificate is provisioning (check hosting dashboard)

**Fix:**
- Wait 10-15 minutes after DNS propagates
- Force renewal in hosting dashboard
- Check hosting SSL settings

### Issue: Shows wrong branding

**Check:**
```sql
-- Verify domain in database
SELECT * FROM "WhiteLabelConfig" 
WHERE "customDomain" = 'elegantbeauty.com';
```

**Fix:**
- Ensure domain is saved in database
- Check middleware is running
- Clear browser cache
- Restart Next.js dev server

### Issue: "Business not found"

**Causes:**
- Domain not in database
- Middleware not detecting domain
- Business marked inactive

**Fix:**
```sql
-- Update domain
UPDATE "WhiteLabelConfig" 
SET "customDomain" = 'elegantbeauty.com',
    "isActive" = true
WHERE "businessId" = 'xxx';
```

---

## 📊 Multi-Domain Management

### Supporting Multiple Domains per Partner

Partners can have BOTH subdomain AND custom domain:

```typescript
// Create with both
{
  subdomain: "elegantbeauty",
  customDomain: "elegantbeauty.com"
}
```

Middleware will match either:
- `elegantbeauty.glambooking.com` → Works
- `elegantbeauty.com` → Works
- Both show same branding

### Wildcard Subdomains

To support unlimited subdomains automatically:

**Vercel:**
1. Add wildcard domain: `*.glambooking.com`
2. All subdomains work automatically

**DNS:**
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

---

## 🔐 Security Considerations

### SSL/TLS

- Always use HTTPS (enforced by hosting)
- Certificates auto-renew
- Monitor expiry dates

### DNS Security

- Use DNSSEC if available
- Enable registrar lock
- Monitor DNS changes
- Use strong registrar passwords

### Subdomain Takeover Prevention

```typescript
// Middleware validation
if (subdomain) {
  // Check subdomain exists in database
  const config = await prisma.whiteLabelConfig.findFirst({
    where: { subdomain, isActive: true }
  })
  
  if (!config) {
    // Return 404, don't expose system
    return new Response('Not Found', { status: 404 })
  }
}
```

---

## 📈 Production Checklist

### Before Going Live

- [ ] DNS records configured correctly
- [ ] SSL certificate provisioned
- [ ] Domain added to hosting provider
- [ ] White-label config in database
- [ ] Branding tested on custom domain
- [ ] Payment flow tested
- [ ] Email sending works (correct domain)
- [ ] Monitoring set up

### Partner Onboarding Checklist

Provide partners with:
- [ ] DNS configuration instructions
- [ ] Expected timeline (24-48 hours)
- [ ] Support contact
- [ ] Testing URL (subdomain first)
- [ ] Documentation link

---

## 🎓 Advanced: Dynamic Domain Addition

### Auto-Add Domains via API

Create endpoint for partners to add domains themselves:

```typescript
// app/api/business/domain/route.ts
export async function POST(req: Request) {
  const { businessId, customDomain } = await req.json()
  
  // Verify domain ownership
  const verified = await verifyDomainOwnership(customDomain)
  
  if (!verified) {
    return Response.json({ error: 'Domain not verified' })
  }
  
  // Add to database
  await prisma.whiteLabelConfig.update({
    where: { businessId },
    data: { customDomain }
  })
  
  // Add to Vercel via API
  await addDomainToVercel(customDomain)
  
  return Response.json({ success: true })
}
```

### Domain Verification

```typescript
async function verifyDomainOwnership(domain: string) {
  const verificationCode = generateCode()
  
  // Partner adds TXT record:
  // _glambooking-verify.elegantbeauty.com TXT "code123"
  
  const txtRecords = await dns.resolveTxt(`_glambooking-verify.${domain}`)
  return txtRecords.flat().includes(verificationCode)
}
```

---

## 💡 Best Practices

1. **Start with Subdomain**
   - Let partners test with subdomain first
   - Switch to custom domain when ready

2. **Document Everything**
   - Provide clear DNS instructions
   - Include screenshots
   - Offer support during setup

3. **Set Expectations**
   - Tell partners DNS can take 24-48 hours
   - Test subdomain while waiting
   - Provide status updates

4. **Monitor Domains**
   - Alert if DNS changes
   - Monitor SSL expiry
   - Track domain health

5. **Automate When Possible**
   - Use hosting provider APIs
   - Auto-provision SSL
   - Auto-verify DNS

---

## 🔗 Useful Tools

- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html
- **Domain Tools**: https://whois.domaintools.com
- **Vercel Docs**: https://vercel.com/docs/concepts/projects/custom-domains
- **Netlify Docs**: https://docs.netlify.com/domains-https/custom-domains/

---

## 📞 Partner Support Template

Email template for partners:

```
Subject: Custom Domain Setup for [Partner Name]

Hi [Partner Name],

Great news! Your white-label booking platform is ready. Here's how to connect your custom domain:

**Step 1: Add DNS Record**
Login to your domain registrar (GoDaddy, Namecheap, etc.) and add:

Type: CNAME
Name: @
Value: [your-app].vercel.app
TTL: 3600

**Step 2: Wait**
DNS changes take 24-48 hours. We'll notify you when ready.

**Step 3: Test**
While waiting, test your subdomain:
https://[partner].glambooking.com

Need help? Reply to this email!

Best regards,
The GlamBooking Team
```

---

## 🎉 Summary

**Easy Path (Subdomain):**
1. Create white-label with subdomain
2. Works immediately
3. Share: `partner.glambooking.com`

**Professional Path (Custom Domain):**
1. Partner provides domain
2. Add to hosting (Vercel/Netlify)
3. Partner adds DNS CNAME
4. Wait 24-48 hours
5. Create white-label with custom domain
6. Works automatically!

Both paths:
- ✅ Custom branding
- ✅ 1% platform fee
- ✅ Automatic SSL
- ✅ Full functionality

Start with subdomains, upgrade to custom domains as partners grow! 🚀

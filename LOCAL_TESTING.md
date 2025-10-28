# 🧪 Local Testing Guide - White-Label Subdomains

## Quick Setup (2 Minutes)

### Step 1: Edit Hosts File

**Windows:**
1. Open Notepad as Administrator
2. File → Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the bottom:
```
127.0.0.1 test.localhost
```
4. Save the file

**Mac/Linux:**
```bash
sudo nano /etc/hosts
# Add this line:
127.0.0.1 test.localhost
# Save: Ctrl+O, Enter, Ctrl+X
```

### Step 2: Access Subdomain

Visit: `http://test.localhost:3000`

**Result:** Should show custom branding! ✨

---

## How It Works

```
You visit: test.localhost:3000
↓
Middleware detects: "test" subdomain
↓
Queries database:
  WHERE subdomain = 'test'
↓
Loads branding config
↓
Applies custom colors/logo
```

---

## Testing Multiple Partners

Add multiple subdomains:

```
# hosts file
127.0.0.1 test.localhost
127.0.0.1 partner1.localhost
127.0.0.1 partner2.localhost
127.0.0.1 salon.localhost
```

Then visit each:
- `http://test.localhost:3000`
- `http://partner1.localhost:3000`
- `http://partner2.localhost:3000`

---

## Production Testing

**After deploying to Vercel/Netlify:**

Subdomain works instantly:
- `https://test.glambooking.com` ✅ (no setup needed!)

Vercel/Netlify automatically handles wildcard subdomains.

---

## Troubleshooting

### Issue: "Can't connect"

**Solution:**
```bash
# Check hosts file was saved
type C:\Windows\System32\drivers\etc\hosts

# Should show:
127.0.0.1 test.localhost
```

### Issue: Shows main site, not custom branding

**Reasons:**
1. Database doesn't have subdomain `test`
2. Middleware not detecting subdomain
3. Browser cache

**Fix:**
```bash
# Clear browser cache
Ctrl+Shift+Delete

# Check database
# In your admin panel, verify subdomain is exactly "test"

# Restart dev server
npm run dev
```

### Issue: TypeScript errors

**Fix:**
```bash
npx prisma generate
npm run dev
```

---

## Complete Test Flow

1. **Create Partner:**
   ```
   Go to: http://localhost:3000/admin/whitelabel/create
   Subdomain: test
   Colors: Pick custom colors
   Create
   ```

2. **Add to Hosts:**
   ```
   127.0.0.1 test.localhost
   ```

3. **Visit:**
   ```
   http://test.localhost:3000
   ```

4. **Verify:**
   - Custom colors applied? ✅
   - Logo shows? ✅
   - Brand name in title? ✅
   - Booking pages work? ✅

---

## What Gets Branded

- ✅ All `bg-glam-pink` → Partner's primary color
- ✅ All `text-glam-pink` → Partner's primary color
- ✅ Logo (if provided)
- ✅ Page title
- ✅ Favicon (if provided)
- ✅ Business dashboard
- ✅ Customer booking pages

---

## Need Help?

**Can't edit hosts file?**
- Run Notepad as Administrator
- Or use Visual Studio Code with admin privileges

**Permission denied?**
- Right-click Notepad → "Run as administrator"
- Then open hosts file

**Still not working?**
- Check subdomain spelling in database
- Restart browser completely
- Clear all cookies/cache
- Check dev server is running

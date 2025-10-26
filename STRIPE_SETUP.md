# Stripe Setup Instructions

## Current Status
✅ **Demo Mode Active** - The app automatically creates Stripe products and prices if they don't exist.

## For Production Setup

### 1. Create Stripe Products and Prices

1. **Login to Stripe Dashboard**: https://dashboard.stripe.com
2. **Go to Products**: https://dashboard.stripe.com/products
3. **Create 3 Products**:

#### Starter Plan
- Name: `GlamBooking Starter Plan`
- Price: `£30.00 GBP / month`
- Copy the Price ID (starts with `price_`)

#### Professional Plan
- Name: `GlamBooking Professional Plan`
- Price: `£50.00 GBP / month`
- Copy the Price ID (starts with `price_`)

#### Enterprise Plan
- Name: `GlamBooking Enterprise Plan`
- Price: `£100.00 GBP / month`
- Copy the Price ID (starts with `price_`)

### 2. Update Environment Variables

Replace the demo price IDs in `.env.local`:

```env
# Replace with your actual Stripe Price IDs
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_your_starter_price_id
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id
```

### 3. Test Cards

For testing, use these Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### 4. Webhooks (Optional)

For production, set up webhooks to handle:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Demo Mode Features

The current demo mode:
- ✅ Automatically creates Stripe products if they don't exist
- ✅ Works with test Stripe keys
- ✅ Handles 14-day free trials
- ✅ Redirects to success page after payment
- ✅ No real charges in test mode

## Troubleshooting

### "No such price" Error
- The app now automatically creates demo prices
- Check your Stripe secret key is correct
- Ensure you're using test mode keys for development

### Checkout Not Loading
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for JavaScript errors
- Ensure middleware is properly configured

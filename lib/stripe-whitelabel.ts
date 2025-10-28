import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

/**
 * Create a Stripe subscription for white-label monthly billing
 * This charges £200/month to the white-label partner
 */
export async function createWhiteLabelSubscription(
  customerId: string,
  businessId: string,
  monthlyFee: number = 200
) {
  try {
    // Create or get the white-label product
    let product = await stripe.products.search({
      query: `name:'White-Label Platform Access'`,
    }).then(res => res.data[0])

    if (!product) {
      product = await stripe.products.create({
        name: 'White-Label Platform Access',
        description: 'Monthly subscription for white-label booking platform',
        metadata: {
          type: 'whitelabel'
        }
      })
    }

    // Create or get the price
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      currency: 'gbp',
      recurring: { interval: 'month' },
    })

    let price = prices.data.find(p => 
      p.unit_amount === Math.round(monthlyFee * 100)
    )

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(monthlyFee * 100),
        currency: 'gbp',
        recurring: {
          interval: 'month',
        },
        metadata: {
          type: 'whitelabel'
        }
      })
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      metadata: {
        businessId,
        type: 'whitelabel'
      },
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    })

    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice)
        ?.payment_intent 
        ? ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent).client_secret
        : null,
      status: subscription.status
    }
  } catch (error) {
    console.error('Error creating white-label subscription:', error)
    throw error
  }
}

/**
 * Create a Stripe customer for white-label partner
 */
export async function createStripeCustomer(
  email: string,
  name: string,
  businessId: string
) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        businessId,
        type: 'whitelabel'
      }
    })

    return customer.id
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

/**
 * Cancel white-label subscription
 */
export async function cancelWhiteLabelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

/**
 * Reactivate white-label subscription
 */
export async function reactivateWhiteLabelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })
    return subscription
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw error
  }
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method']
    })
    return subscription
  } catch (error) {
    console.error('Error getting subscription:', error)
    throw error
  }
}

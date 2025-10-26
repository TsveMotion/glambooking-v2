# 💎 GlamBooking - Premium Online Booking for Beauty Professionals

GlamBooking is a modern, elegant SaaS platform designed specifically for salons, beauticians, and hairdressers to manage their business online. Built with Next.js 14, TypeScript, and a beautiful UI that reflects the glamour of the beauty industry.

## 🌟 Features

- **🏠 Beautiful Homepage** - Modern, responsive landing page with GlamBooking branding
- **🔐 Authentication** - Secure login/register pages powered by Clerk
- **📄 Public Pages** - About, Pricing, and Contact pages with professional design
- **🎨 Custom Design System** - Glam pink (#E75480) and gold (#FFD700) color scheme
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **⚡ Modern Stack** - Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI

## 🎨 Design Theme

**Primary Colors:**
- Glam Pink: `#E75480`
- Gold: `#FFD700`
- Soft White: `#FFF8F8`
- Charcoal: `#1C1C1C`

**Typography:** Inter & Poppins fonts for a modern, professional look

**Style:** Modern, feminine, professional, elegant - similar to Apple or Notion but with beauty-industry flair.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glambooking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Images:** Cloudinary
- **Email:** SendGrid
- **Icons:** Lucide React
- **Fonts:** Inter & Poppins (Google Fonts)

## 📄 Pages Overview

### Public Pages
- **`/`** - Homepage with hero section, features, testimonials, and CTA
- **`/about`** - Company information, mission, values, and team
- **`/pricing`** - Subscription plans (Starter £30, Professional £50, Enterprise £100)
- **`/contact`** - Contact form and business information

### Authentication Pages
- **`/login`** - User login with Clerk integration
- **`/register`** - User registration with Clerk integration

## 🎯 Subscription Plans

| Plan | Price | Staff Limit | Features |
|------|-------|-------------|----------|
| **Starter** | £30/month | Up to 3 staff | Unlimited bookings, Basic analytics, Email notifications |
| **Professional** | £50/month | Up to 10 staff | Advanced analytics, Email & SMS, Priority support, Custom branding |
| **Enterprise** | £100/month | Unlimited staff | Premium analytics, Dedicated support, Multi-location, API access |

*All plans include a 5% transaction fee and 14-day free trial*

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

The project uses the following environment variables (already configured in `.env.local`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgres://...

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_CLIENT_ID=ca_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Cloudinary
CLOUDINARY_URL=cloudinary://...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

# SendGrid
SENDGRID_API_KEY=placeholder
```

## 🚀 Deployment

This project is ready for deployment on platforms like:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/UI** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide React** for the icon library
- **Clerk** for authentication services
- **Stripe** for payment processing

---

**Built with ❤️ for the beauty industry**

*GlamBooking - Where beauty meets technology*

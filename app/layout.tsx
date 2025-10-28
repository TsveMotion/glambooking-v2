import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'GlamBooking - Premium Online Booking for Salons & Beauticians',
  description: 'The ultimate booking platform for salons, beauticians, and hairdressers. Manage appointments, clients, and payments all in one elegant dashboard.',
  keywords: 'salon booking, beauty appointments, hairdresser booking, online scheduling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const appShell = (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        {children}
      </body>
    </html>
  )

  if (!publishableKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'ClerkProvider disabled because NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. ' +
          'Authentication is bypassed for local development.'
      )
    }
    return appShell
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {appShell}
    </ClerkProvider>
  )
}

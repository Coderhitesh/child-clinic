import './globals.css';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/providers/auth-provider';

export const metadata = {
  title: {
    default: 'Normal Child Clinic — Life for hopeless children',
    template: '%s · Normal Child Clinic',
  },
  icons: { icon: '/favicon.png', apple: '/images/logo.png' },
  description:
    'Book trusted doctors across our network of multi-speciality clinics. Online appointments, digital prescriptions and follow-up care for the whole family.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-sans:'Plus Jakarta Sans';--font-hand:'Caveat';}`}</style>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

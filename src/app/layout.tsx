import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChildClub Management System',
  description: 'Complete school management platform for schools, teachers, students, and super admin',
  keywords: ['school management', 'education', 'student portal', 'teacher dashboard'],
  authors: [{ name: 'ChildClub Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const apiUrl = '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}';
                console.log('%c🔗 Backend API URL:', 'color: #4CAF50; font-weight: bold; font-size: 16px;', apiUrl);
                console.log('%c📡 API Base URL:', 'color: #2196F3; font-weight: bold; font-size: 14px;', apiUrl);
                console.log('%c🌐 Environment:', 'color: #FF9800; font-weight: bold;', '${process.env.NODE_ENV || 'development'}');
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}

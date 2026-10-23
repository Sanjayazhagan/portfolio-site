import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { getProjects, getPillars } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sanjayazhagan.tech'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Sanjay Azhagan | Next.js Developer & AI Specialist',
    template: '%s | Sanjay Azhagan',
  },
  description:
    'Portfolio of Sanjay Azhagan, a passionate Software Engineering Intern specializing in Next.js, React, Distributed Systems, and AI technologies. Explore my projects including VeriLaw and React applications.',
  keywords: [
    'Sanjay Azhagan',
    'Next.js developer',
    'React',
    'AI',
    'Software Engineer',
    'Frontend Developer',
    'Web Development',
    'VeriLaw',
  ],
  authors: [{ name: 'Sanjay Azhagan', url: 'https://sanjayazhagan.tech' }],
  creator: 'Sanjay Azhagan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sanjayazhagan.tech',
    title: 'Sanjay Azhagan | Next.js Developer & AI Specialist',
    description:
      'Portfolio of Sanjay Azhagan, a passionate Software Engineering Intern specializing in Next.js, React, Distributed Systems, and AI technologies.',
    siteName: 'Sanjay Azhagan Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sanjay Azhagan | Next.js Developer & AI Specialist',
    description:
      'Portfolio of Sanjay Azhagan, a passionate Software Engineering Intern specializing in Next.js, React, Distributed Systems, and AI technologies.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { CustomCursor } from "@/components/ui/CustomCursor";
import { AnalyticsLoader } from "@/components/AnalyticsLoader";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projects = await getProjects();
  const pillars = await getPillars();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-24 overflow-x-hidden text-slate-50 relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Sanjay Azhagan',
              url: 'https://sanjayazhagan.tech',
              jobTitle: 'Software Engineer',
              description:
                'Software Engineer specializing in Next.js, React, Distributed Systems, and AI.',
              knowsAbout: ['Next.js', 'React', 'Distributed Systems', 'Artificial Intelligence', 'Web Development'],
              sameAs: [
                'https://github.com/Sanjayazhagan',
              ],
            }),
          }}
        />
        <AnalyticsLoader />
        <CustomCursor />
        <Header projects={projects} pillars={pillars} />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          {children}
        </main>
      </body>
    </html>
  );
}

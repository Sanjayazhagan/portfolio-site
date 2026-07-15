import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { getProjects, getPillars } from "@/lib/data";
import { AvatarProvider } from "@/components/providers/AvatarProvider";

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
  title: "Sanjay Azhagan | Portfolio",
  description: "Software Engineering Intern | Distributed Systems & AI",
};

import { CustomCursor } from "@/components/ui/CustomCursor";

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
      <body className="min-h-full flex flex-col pt-24 pb-12 overflow-x-hidden text-slate-50 relative">
        <CustomCursor />
        <AvatarProvider>
          <Header projects={projects} pillars={pillars} />
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
            {children}
          </main>
        </AvatarProvider>
      </body>
    </html>
  );
}

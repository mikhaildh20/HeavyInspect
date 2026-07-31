import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeavyInspect",
  description: "Platform Inspeksi P2H Digital Terintegrasi",
  icons: {
    icon: "/assets/HeavyInspect.png",
    apple: "/assets/HeavyInspect.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AppShell role={role}>{children}</AppShell>
      </body>
    </html>
  );
}

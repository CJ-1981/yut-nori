import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Yut Nori - Korean Traditional Board Game",
  description: "Play Yut Nori, a 2000-year-old Korean traditional board game. Features 3D yut throwing animation, multiplayer, beginner mode, and multi-language support.",
  keywords: ["Yut Nori", "Korean game", "board game", "윷놀이", "traditional game", "multiplayer"],
  authors: [{ name: "Yut Nori Game" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F5E6C8',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

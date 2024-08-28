import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import NextAuthProvider from "@/providers/NextAuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: {
    template: "%s - YourTube",
    default: "YourTube",
  },
  description: `Welcome to YourTube - Your go-to platform for amazing videos!
  Discover a world of content with our incredible features. Enjoy seamless streaming, 
  personalized recommendations, and much more. Download YourTube now and embark on a visual journey 
  like never before!`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <TRPCReactProvider>
          <NextAuthProvider>
            <ThemeProvider defaultTheme="light" enableSystem={false}>
              <NextTopLoader showSpinner={false} color="#000" />
              {children}
            </ThemeProvider>
          </NextAuthProvider>
          <Toaster position="bottom-right" />
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}

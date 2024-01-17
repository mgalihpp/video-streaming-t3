import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";
import NextSessionProvider from "@/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import { Wrapper } from "@/components";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Video App",
  description: `Welcome to Video App - Your go-to platform for amazing videos!
  Discover a world of content with our incredible features. Enjoy seamless streaming, 
  personalized recommendations, and much more. Download Video App now and embark on a visual journey 
  like never before!`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} max-w-screen-2xl`}>
        <NextSessionProvider>
          <TRPCReactProvider cookies={cookies().toString()}>
            <Wrapper>{children}</Wrapper>
          </TRPCReactProvider>
        </NextSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}

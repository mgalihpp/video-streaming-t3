"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLoginWithDiscord = async () => {
    setIsLoading(true);
    await signIn("discord").then((res) => {
      if (res?.ok) {
        router.push("/");
      }

      if (res?.error) {
        toast.error(`Failed attempt to login: ${res.error}`);
      }
    });
  };
  const handleLoginWithGoogle = async () => {
    setIsLoading(true);
    await signIn("google").then((res) => {
      if (res?.ok) {
        router.push("/");
      }

      if (res?.error) {
        toast.error(`Failed attempt to login: ${res.error}`);
      }
    });
  };

  useEffect(() => {
    if (session.data) {
      router.push("/");
    }
  }, [session.data]);

  return (
    <div className="min-h-screen w-full px-4 lg:grid lg:grid-cols-2 lg:px-0">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground lg:text-nowrap">
              Choose an provider below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full items-center gap-2"
              onClick={handleLoginWithDiscord}
              disabled={isLoading}
            >
              <Discord className="size-5" />
              Login with Discord
            </Button>
            <Button
              variant="outline"
              className="w-full items-center gap-2"
              onClick={handleLoginWithGoogle}
              disabled={isLoading}
            >
              <Google className="size-5" />
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-start text-xs">
            By creating an account, you agree to our{" "}
            <Link href="/blog/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/blog/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/login_banner.jpeg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

const Discord = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <path
        fill="#8c9eff"
        d="M40,12c0,0-4.585-3.588-10-4l-0.488,0.976C34.408,10.174,36.654,11.891,39,14c-4.045-2.065-8.039-4-15-4s-10.955,1.935-15,4c2.346-2.109,5.018-4.015,9.488-5.024L18,8c-5.681,0.537-10,4-10,4s-5.121,7.425-6,22c5.162,5.953,13,6,13,6l1.639-2.185C13.857,36.848,10.715,35.121,8,32c3.238,2.45,8.125,5,16,5s12.762-2.55,16-5c-2.715,3.121-5.857,4.848-8.639,5.815L33,40c0,0,7.838-0.047,13-6C45.121,19.425,40,12,40,12z M17.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C21,28.209,19.433,30,17.5,30z M30.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C34,28.209,32.433,30,30.5,30z"
      ></path>
    </svg>
  );
};

const Google = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  );
};

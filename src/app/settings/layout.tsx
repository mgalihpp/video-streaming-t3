import React from "react";

export async function generateMetadata() {
  return {
    title: "Your Settings",
  };
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

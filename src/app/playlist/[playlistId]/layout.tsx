import React from "react";

interface PlaylistLayoutProps {
  children: React.ReactNode;
}

export default async function PlaylistLayout({
  children,
}: PlaylistLayoutProps) {
  return <>{children}</>;
}

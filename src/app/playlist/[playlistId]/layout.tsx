import React from "react";

interface PlaylistLayoutProps {
  children: React.ReactNode;
  params: {
    playlistId: string;
  };
}

export default async function PlaylistLayout({
  children,
  params,
}: PlaylistLayoutProps) {
  return <>{children}</>;
}

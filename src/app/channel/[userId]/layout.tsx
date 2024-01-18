import { ProfileHeader } from "@/components";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import React from "react";

interface ChannelLayoutProps {
  children?: React.ReactNode;
  params: { userId: string };
}

export default async function ChannelLayout({
  children,
  params,
}: ChannelLayoutProps) {
  const sessionData = await getServerAuthSession();

  const { user, viewer } = await api.user.getChannelById.query({
    id: params.userId,
    viewerId: sessionData?.user.id ?? "",
  });

  return (
    <>
      <ProfileHeader
        channelId={params.userId}
        userId={sessionData?.user.id ?? ""}
        user={user}
        viewer={viewer}
      />
      {children}
    </>
  );
}

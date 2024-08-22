import { ErrorMessage } from "@/components/ErrorMessage";
import ProfileHeader from "../_components/ProfileHeader";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import React from "react";
import { type Metadata } from "next";

interface ChannelLayoutProps {
  children?: React.ReactNode;
  params: { userId: string };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const userChannelData = await api.user.getUserChannel({
    id: props.params?.userId ?? "",
  });

  if (!userChannelData) {
    return {
      title: "Channel not found",
      description: "Sorry there is an error to loading channel page",
    };
  }

  return {
    title:
      userChannelData.user.name +
      `${userChannelData.user.handle ? "-" + userChannelData.user.handle : ""}`,
    description: userChannelData.user.description,
    openGraph: {
      title: userChannelData.user.name ?? "",
      description: userChannelData.user.description ?? "",
      images: [
        {
          url: userChannelData.user.image ?? "",
          width: 60,
          height: 60,
          alt: `Profile image of ${userChannelData.user.name}`,
        },
      ],
      url: `http://localhost:3000/channel/${userChannelData.user.id}`,
    },
  };
}

export default async function ChannelLayout({
  children,
  params,
}: ChannelLayoutProps) {
  const sessionData = await getServerAuthSession();

  const userChannelData = await api.user.getUserChannel({
    id: params.userId,
    viewerId: sessionData?.user.id,
  });

  if (!userChannelData) {
    return (
      <ErrorMessage
        icon="People"
        message="Channel not found"
        description="Sorry there is an error to loading channel page"
      />
    );
  }

  return (
    <>
      <ProfileHeader
        channelId={params.userId}
        userId={sessionData?.user.id ?? ""}
        user={userChannelData.user}
        viewer={userChannelData.viewer}
      />
      {children}
    </>
  );
}

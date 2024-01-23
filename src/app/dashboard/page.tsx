import { UploadButton, VideoTables } from "@/components";
import { GreenEye, GreenHeart, GreenUserCheck } from "@/components/Icons/Icons";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

interface StatsItem {
  name: string;
  stat: number;
  icon: (className: string) => JSX.Element;
}

export async function generateMetadata() {
  return {
    title: "Your Dashboard",
  };
}

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) return redirect("/api/auth/signin");

  const { totalLikes, totalViews, totalFollowers } =
    await api.user.getDashboardData.query("User Dashboard");

  const stats: StatsItem[] = [
    {
      name: "Total Views",
      stat: totalViews,
      icon: (className) => <GreenEye className={className} />,
    },
    {
      name: "Total Followers",
      stat: totalFollowers,
      icon: (className) => <GreenUserCheck className={className} />,
    },
    {
      name: "Total Likes",
      stat: totalLikes,
      icon: (className) => <GreenHeart className={className} />,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-8 bg-white pt-3 shadow sm:rounded-lg">
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="pt-1.5">
              <h1 className="text-2xl font-bold text-gray-900">
                <span>Hello,</span> {session.user.name}!
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Manage your channel and videos here.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <UploadButton />
          </div>
        </div>
        <div>
          <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200  shadow-sm   md:grid-cols-3 md:divide-x md:divide-y-0">
            {stats.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center justify-center px-4 py-5 sm:p-6"
              >
                {item.icon("h-4 w-4 ")}
                <dt className="text-base font-normal text-gray-900">
                  {item.name}
                </dt>
                <dd className="text-primary-600 mt-1 text-3xl font-semibold md:block lg:flex">
                  {item.stat}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <VideoTables />
      </div>
    </>
  );
}

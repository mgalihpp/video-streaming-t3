import {
  DeleteButton,
  EditButton,
  PublishButton,
  Thumbnail,
} from "@/components";
import { GreenEye, GreenHeart, GreenUserCheck } from "@/components/Icons/Icons";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
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

  const { user, videos, totalLikes, totalViews, totalFollowers } =
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
            {/* <UploadButton refetch={refetch} /> */}
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

        <Table className="rounded-lg shadow">
          <TableCaption>Your video</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[350px]">Video</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead className="text-center">Likes/Dislikes</TableHead>
              <TableHead className="text-center">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="flex h-[100px] w-[350px] flex-row">
                  <Link
                    href={`/watch?video=${video.id}`}
                    className="relative h-full w-1/2"
                  >
                    <Thumbnail thumbnailUrl={video.thumbnailUrl} />
                  </Link>
                  <div className="flex h-full w-1/2 flex-col justify-center truncate px-1">
                    <p className="text-sm text-gray-900">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {video.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <PublishButton video={video} />
                </TableCell>
                <TableCell className="text-center">
                  <p className="whitespace-nowrap px-3 py-5 text-sm text-gray-600">
                    {video.createdAt.toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <p className="whitespace-nowrap px-3 py-5 text-sm text-gray-600">
                    {video.views}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <p className="whitespace-nowrap px-3 py-5 text-sm text-gray-600">
                    {video.comments}
                  </p>
                </TableCell>
                <TableCell className="flex flex-col text-center">
                  <p className="text-center text-green-700">
                    {video.likes} Likes
                  </p>
                  <p className="text-center text-red-700">
                    {video.dislikes} Dislikes
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row items-center justify-center">
                    <DeleteButton videoId={video.id} />
                    <EditButton video={video} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {/* {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell>{invoice.paymentStatus}</TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell className="text-right">
                  {invoice.totalAmount}
                </TableCell>
              </TableRow>
            ))} */}
          </TableBody>
          {/* <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">$2,500.00</TableCell>
            </TableRow>
          </TableFooter> */}
        </Table>
        {/* <div className="rounded-2xl border border-gray-200 p-6 px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      ></th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Uploaded
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Rating
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Data Uploaded
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {videos.map((video) => (
                      <tr key={video.id}>
                        <PublishButton video={video} />
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                          <div className="flex flex-row items-center justify-center">
                            <div className="h-16 w-16 flex-shrink-0 items-center justify-center flex">
                              <Thumbnail thumbnailUrl={video.thumbnailUrl} />
                            </div>
                            <div className="ml-4 font-medium text-gray-900 truncate max-w-24">
                              {video.title}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            {video.likes} Likes
                          </span>
                          <span className="inline-flex items-center rounded-full  bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                            {video.dislikes} Dislikes
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-600">
                          {video.createdAt.toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-600">
                          <div className="flex flex-row gap-2">
                            <DeleteButton videoId={video.id} />

                            <EditButton
                                    video={{
                                      id: video?.id || "",
                                      title: video?.title || "",
                                      description: video?.description || "",
                                      thumbnailUrl: video?.thumbnailUrl || "",
                                    }}
                                    refetch={refetch}
                                  />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}

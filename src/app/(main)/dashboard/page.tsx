import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  UsersIcon,
  ActivityIcon,
  DollarSignIcon,
  MoveVerticalIcon,
} from "lucide-react";
import { getServerAuthSession } from "@/server/auth";
import { UploadButton } from "@/components/button/UploadButton";
import { Suspense } from "react";
import { api } from "@/trpc/server";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerAuthSession();

  const userStatsData = await api.user.getUserStats();

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full flex-col">
          <h2 className="text-lg font-bold md:text-3xl">
            Welcome, {session?.user.name}
          </h2>
          <p className="text-sm font-medium text-primary/80">
            You can manage your channel and all of your content here.
          </p>
        </div>

        <div className="max-md:w-full">
          <Suspense>
            <UploadButton />
          </Suspense>
        </div>
      </div>

      <section className="grid flex-1 items-start gap-4 md:gap-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStatsData.totalViews}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                New Subscribers
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{userStatsData.totalFollowers}
              </div>
              <p className="text-xs text-muted-foreground">
                +25% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Engagement Rate
              </CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  ((userStatsData.totalLikes ?? 0) /
                    (userStatsData.totalViews ?? 0)) *
                  100
                ).toFixed(2)}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                +3.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Your latest content uploads.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Views
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Likes
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStatsData.userVideos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="font-medium">
                        <div className="flex gap-2 break-words">
                          <div className="relative flex-shrink-0">
                            <Image
                              className="aspect-video rounded-lg"
                              width={100}
                              height={100}
                              src={video.thumbnailUrl}
                              alt={`Video Thumbnail of ${video.title}`}
                            />
                          </div>
                          <p className="max-h-14 max-w-52 overflow-hidden overflow-ellipsis whitespace-pre-wrap break-words">
                            {video.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {video.views}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {video.likes}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {moment(video.createdAt).format("YYYY-MM-DD")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoveVerticalIcon className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Link href={`/dashboard/edit?vId=${video.id}`}>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>
                            <Link
                              href={`/watch?video=${video.id}`}
                              aria-label="View"
                              aria-current="page"
                            >
                              <DropdownMenuItem>View</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* <TableRow>
                    <TableCell className="font-medium">
                      Vlogging Tips for Beginners
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      8,765
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">789</TableCell>
                    <TableCell className="hidden md:table-cell">
                      2023-06-18
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoveVerticalIcon className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Editing Masterclass for YouTubers
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      5,432
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">456</TableCell>
                    <TableCell className="hidden md:table-cell">
                      2023-06-12
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoveVerticalIcon className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow> */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

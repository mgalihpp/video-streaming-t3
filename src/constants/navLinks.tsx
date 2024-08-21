import {
  Brush,
  File,
  HelpCircle,
  Lock,
  LogOut,
  MessagePlusSquare,
  Settings,
  User,
} from "@/components/Icons/Icons";

interface NavigationItem {
  icon: (className: string) => JSX.Element;
  name: string;
  path: string;
  lineAbove: boolean;
}

const signedInNavigation = (userId: string): NavigationItem[] => [
  {
    icon: (className) => <User className={className} />,
    name: "View Profile",
    path: `/channel/${String(userId)}`,
    lineAbove: true,
  },
  {
    icon: (className) => <Brush className={className} />,
    name: "Creator Studio",
    path: `/dashboard`,
    lineAbove: false,
  },
  {
    icon: (className) => <HelpCircle className={className} />,
    name: "Help",
    path: `/blog/help`,
    lineAbove: true,
  },
  {
    icon: (className) => <Settings className={className} />,
    name: "Settings",
    path: `/settings`,
    lineAbove: false,
  },
  {
    icon: (className) => <MessagePlusSquare className={className} />,
    name: "Feedback",
    path: `#`,
    lineAbove: false,
  },
  {
    icon: (className) => <File className={className} />,
    name: "Terms of Service",
    path: `/blog/tems`,
    lineAbove: true,
  },
  {
    icon: (className) => <Lock className={className} />,
    name: "Privacy",
    path: `/blog/privacy`,
    lineAbove: false,
  },
  {
    icon: (className) => <LogOut className={className} />,
    name: "Log Out",
    path: `/api/auth/signout`,
    lineAbove: true,
  },
];

const signOutNavigation: NavigationItem[] = [
  {
    icon: (className) => <HelpCircle className={className} />,
    name: "Help",
    path: "/blog/help",
    lineAbove: true,
  },
  {
    icon: (className) => <MessagePlusSquare className={className} />,
    name: "Feedback",
    path: `mailto:muhammadgalih451@gmail.com`,
    lineAbove: false,
  },
  {
    icon: (className) => <File className={className} />,
    name: "Terms of Service",
    path: `/blog/tems`,
    lineAbove: true,
  },
  {
    icon: (className) => <Lock className={className} />,
    name: "Privacy",
    path: `/blog/privacy`,
    lineAbove: false,
  },
];

export { signedInNavigation, signOutNavigation };

import { GreenHorn, GreenPeople, GreenPlay } from "./Icons/Icons";

type IconSelectionProps = {
  icon: "Horn" | "People" | "Play";
  className: string;
};

type ErrorMessageProps = {
  children?: React.ReactNode;
  icon: "Horn" | "People" | "Play";
  message: string;
  description: string;
  className?: string;
};

export function ErrorMessage({
  children,
  message,
  description,
  icon,
  className,
}: ErrorMessageProps) {
  const IconSelection = ({ icon, className }: IconSelectionProps) => {
    if (icon === "Horn") {
      return <GreenHorn className={className} />;
    } else if (icon === "People") {
      return <GreenPeople className={className} />;
    } else {
      return <GreenPlay className={className} />;
    }
  };

  return (
    <div
      className={`relative mt-16 flex w-full flex-col ${
        className ? className : "items-center justify-center"
      } gap-2 text-center`}
    >
      <IconSelection className="center items-center" icon={icon ?? "Play"} />
      <h1 className="text-2xl font-semibold text-primary">{message}</h1>
      <p className="max-w-xs text-center text-sm text-gray-600">
        {description}
      </p>
      {children}
    </div>
  );
}

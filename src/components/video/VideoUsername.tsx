export function VideoUserName({ name }: { name: string }) {
  return (
    <p className="line-clamp-1 overflow-hidden text-sm font-medium leading-6 text-primary/70">
      {name}
    </p>
  );
}

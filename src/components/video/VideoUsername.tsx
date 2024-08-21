export function VideoUserName({ name }: { name: string }) {
  return (
    <p className="max-h-5 overflow-hidden text-sm font-medium leading-6 text-primary/70">
      {name}
    </p>
  );
}

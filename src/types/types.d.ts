type PageProps = {
  params?: { id?: string; userId?: string };
  searchParams: Record<string, string | string[] | undefined>;
};

import { getProjects } from "@/lib/notion";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const resolvedProjects = await getProjects();

  return <HomeContent resolvedProjects={resolvedProjects} />;
}

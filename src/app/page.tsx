import { HomeContent } from "@/components/home/HomeContent";
import { getProjects, getPillars, getExperiences, getLogs } from "@/lib/data";

export default async function Home() {
  const projects = await getProjects();
  const pillars = await getPillars();
  const experiences = await getExperiences();
  const logs = await getLogs();

  return <HomeContent projects={projects} pillars={pillars} experiences={experiences} logs={logs} />;
}

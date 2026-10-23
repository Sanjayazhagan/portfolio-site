export type PillarLike = { id: string; title: string };
export type ProjectLike = { pillars: string[]; showcase?: boolean | null };

// Projects store pillar titles ("Full-Stack") while tabs use pillar ids ("full-stack"),
// so match on either.
export function matchesPillar(project: ProjectLike, pillarId: string, pillars: PillarLike[]) {
  if (pillarId === "All") return true;
  const title = pillars.find((p) => p.id === pillarId)?.title;
  return project.pillars.includes(pillarId) || (!!title && project.pillars.includes(title));
}

export function showcased<T extends ProjectLike>(projects: T[]) {
  return projects.filter((p) => p.showcase);
}

import { cache } from 'react';
import { prisma } from './prisma';

export const getProjects = cache(async () => {
  const projects = await prisma.project.findMany();
  // Parse pillars from string to array
  return projects.map(p => ({
    ...p,
    pillars: JSON.parse(p.pillars) as string[],
  }));
});

export const getLogs = cache(async () => {
  return await prisma.log.findMany({
    orderBy: { date: 'desc' }
  });
});

export const getPillars = cache(async () => {
  const pillars = await prisma.pillar.findMany();
  const allLogs = await getLogs();
  
  return pillars.map((pillar: any) => ({
    ...pillar,
    logs: allLogs.filter((log: any) => {
      try {
        const logPillars = JSON.parse(log.pillars) as string[];
        return logPillars.includes(pillar.id);
      } catch {
        return false;
      }
    })
  }));
});

export const getExperiences = cache(async () => {
  return await prisma.experience.findMany();
});

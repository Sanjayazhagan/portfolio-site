import { MetadataRoute } from 'next';
import { getProjects, getPillars } from '@/lib/data';

const baseUrl = 'https://sanjayazhagan.tech';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, pillars] = await Promise.all([getProjects(), getPillars()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${baseUrl}/project/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const pillarRoutes: MetadataRoute.Sitemap = pillars.map((p: { id: string }) => ({
    url: `${baseUrl}/pillar/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...pillarRoutes];
}

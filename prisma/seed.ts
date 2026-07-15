import { PrismaClient } from '@prisma/client';
import projects from '../src/data/projects.json';
import pillars from '../src/data/pillars.json';
import experience from '../src/data/experience.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Projects
  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        pillars: JSON.stringify(p.pillars),
        link: p.link || null,
        github: p.github || null,
        linkedin: p.linkedin || null,
        date: p.date,
        image: p.image || null,
        video: p.video || null,
        live: p.live || null,
        content: p.content || '',
      },
    });
  }
  console.log(`Seeded ${projects.length} projects.`);

  // 2. Seed Pillars and Logs
  for (const pillar of pillars) {
    const createdPillar = await prisma.pillar.upsert({
      where: { id: pillar.id },
      update: {},
      create: {
        id: pillar.id,
        title: pillar.title,
        summary: pillar.summary,
        philosophy: pillar.philosophy,
      },
    });

    if (pillar.logs && pillar.logs.length > 0) {
      for (const log of pillar.logs) {
        await prisma.log.upsert({
          where: { id: log.id },
          update: {},
          create: {
            id: log.id,
            date: log.date,
            title: log.title,
            type: log.type,
            content: log.content,
            link: log.link || null,
            pillars: JSON.stringify([pillar.id]),
          },
        });
      }
    }
  }
  console.log(`Seeded ${pillars.length} pillars.`);

  // 3. Seed Experience
  for (const exp of experience) {
    await prisma.experience.create({
      data: {
        role: exp.role,
        company: exp.company,
        period: exp.period,
        description: exp.description,
      },
    });
  }
  console.log(`Seeded ${experience.length} experiences.`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create initial admin user
  const hashedPassword = await bcrypt.hash('Dsaa@5106', 10);
  const user = await prisma.user.upsert({
    where: { email: 'sanjayazhagan@gmail.com' },
    update: {
      hashedPassword: hashedPassword
    },
    create: {
      email: 'sanjayazhagan@gmail.com',
      hashedPassword,
    },
  });
  console.log('Created admin user: sanjayazhagan@gmail.com / Dsaa@5106');

  // Read JSON files
  const dataDir = path.join(__dirname, '../src/data');
  const projectsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf-8'));
  const pillarsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'pillars.json'), 'utf-8'));
  const experienceData = JSON.parse(fs.readFileSync(path.join(dataDir, 'experience.json'), 'utf-8'));

  // Seed Projects
  for (const proj of projectsData) {
    await prisma.project.upsert({
      where: { slug: proj.slug },
      update: {},
      create: {
        id: proj.id,
        slug: proj.slug,
        title: proj.title,
        description: proj.description,
        pillars: JSON.stringify(proj.pillars),
        link: proj.link,
        github: proj.github,
        linkedin: proj.linkedin,
        date: proj.date,
        image: proj.image,
        video: proj.video,
        live: proj.live,
        content: proj.content,
      },
    });
  }
  console.log('Seeded projects');

  // Seed Pillars and Logs
  for (const pillar of pillarsData) {
    await prisma.pillar.upsert({
      where: { id: pillar.id },
      update: {},
      create: {
        id: pillar.id,
        title: pillar.title,
        summary: pillar.summary,
        philosophy: pillar.philosophy,
      },
    });

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
          link: log.link,
          pillars: JSON.stringify([pillar.id]),
        },
      });
    }
  }
  console.log('Seeded pillars and logs');

  // Seed Experience
  for (const exp of experienceData) {
    await prisma.experience.upsert({
      where: { id: exp.id },
      update: {},
      create: {
        id: exp.id,
        role: exp.role,
        company: exp.company,
        period: exp.period,
        description: exp.description,
      },
    });
  }
  console.log('Seeded experience');

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

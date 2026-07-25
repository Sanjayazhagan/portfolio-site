"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

export async function saveProject(data: any) {
  const { id, pillars, tags, ...rest } = data;
  const dbData = {
    ...rest,
    pillars: JSON.stringify(pillars || []),
    tags: JSON.stringify(tags || []),
  };
  
  if (id) {
    await prisma.project.update({ where: { id }, data: dbData });
  } else {
    await prisma.project.create({ data: dbData });
  }
  revalidatePath("/");
  revalidatePath("/admin");
  if (data.slug) {
    revalidatePath(`/project/${data.slug}`);
  }
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveExperience(data: any) {
  const { id, ...rest } = data;
  if (id) {
    await prisma.experience.update({ where: { id }, data: rest });
  } else {
    await prisma.experience.create({ data: rest });
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteExperience(id: string) {
  await prisma.experience.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function savePillar(data: any) {
  const { id, ...rest } = data;
  // Upsert since id might be provided for a new pillar (it's a string slug usually)
  await prisma.pillar.upsert({
    where: { id },
    update: rest,
    create: { id, ...rest },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deletePillar(id: string) {
  await prisma.pillar.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function changePassword(email: string, oldPass: string, newPass: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(oldPass, user.hashedPassword);
  if (!isValid) throw new Error("Invalid old password");

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await prisma.user.update({
    where: { email },
    data: { hashedPassword },
  });
  return { success: true };
}

export async function saveLog(data: any) {
  const { id, pillars, projectIds, ...rest } = data;
  const dbData = {
    ...rest,
    pillars: JSON.stringify(pillars || []),
    projectIds: JSON.stringify(projectIds || []),
  };
  
  if (id) {
    await prisma.log.update({ where: { id }, data: dbData });
  } else {
    await prisma.log.create({ data: dbData });
  }
  revalidatePath("/");
  revalidatePath("/admin");
  // Also revalidate all pillar pages
  const allPillars = await prisma.pillar.findMany();
  allPillars.forEach(p => revalidatePath(`/pillar/${p.id}`));
}

export async function deleteLog(id: string) {
  await prisma.log.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
  const allPillars = await prisma.pillar.findMany();
  allPillars.forEach(p => revalidatePath(`/pillar/${p.id}`));
}

"use server";

import { prisma } from "@/lib/prisma";

function serializeData(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? Number(value) : value,
    ),
  );
}

export async function getUserWorkspaces(userId: string) {
  try {
    const data = await prisma.workspace.findMany({
      where: { author_id: userId },
    });
    return serializeData(data);
  } catch (error) {
    console.error("Failed to load user workspaces", { userId, error });
    throw new Error("Unable to load workspaces from the database");
  }
}

export async function createWorkspace(userId: string, name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const data = await prisma.workspace.create({
    data: {
      nama_workspace: name,
      slug: slug,
      author_id: userId,
    },
  });
  return serializeData(data);
}

export async function getWorkspaceById(workspaceId: string | number) {
  const data = await prisma.workspace.findFirst({
    where: { id_workspace: BigInt(workspaceId) },
  });
  return serializeData(data);
}

export async function getAllWorkspaces() {
  const data = await prisma.workspace.findMany();
  return serializeData(data);
}

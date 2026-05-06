import { prisma } from '@/lib/prisma';

function serializeData(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export async function getUserWorkspaces(userId: string) {
  const data = await prisma.workspace.findMany({
    where: { author_id: userId }
  });
  return serializeData(data);
}

export async function createWorkspace(userId: string, name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const data = await prisma.workspace.create({
    data: {
      nama_workspace: name,
      slug: slug,
      author_id: userId,
    }
  });
  return serializeData(data);
}

export async function getWorkspaceById(workspaceId: string | number) {
  const data = await prisma.workspace.findFirst({
    where: { id_workspace: BigInt(workspaceId) }
  });
  return serializeData(data);
}

export async function getAllWorkspaces() {
  const data = await prisma.workspace.findMany();
  return serializeData(data);
}

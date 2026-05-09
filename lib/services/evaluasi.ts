"use server";

import { prisma } from '@/lib/prisma';

function serializeData(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export async function getEvaluasiByKonten(idKonten: number | string) {
  const data = await prisma.evaluasi.findFirst({
    where: { id_konten: BigInt(idKonten) }
  });
  return serializeData(data);
}

export async function createEvaluasi(evaluasiData: any) {
  // nilai_er is a GENERATED ALWAYS column in the database.
  // It is computed automatically: ((likes + comment + shares + favorites) / views) * 100
  // We must NOT include it in the insert payload.
  const { nilai_er, ...safeData } = evaluasiData;

  const data = await prisma.evaluasi.create({
    data: safeData
  });

  return serializeData(data);
}

export async function updateEvaluasi(idEvaluasi: number | string, updates: any) {
  // nilai_er is a GENERATED ALWAYS column — exclude it from updates.
  const { nilai_er, ...safeUpdates } = updates;

  const data = await prisma.evaluasi.update({
    where: { id_evaluasi: BigInt(idEvaluasi) },
    data: {
      ...safeUpdates,
      updated_at: new Date(),
    }
  });

  return serializeData(data);
}

export async function deleteEvaluasi(idEvaluasi: number | string) {
  await prisma.evaluasi.delete({
    where: { id_evaluasi: BigInt(idEvaluasi) }
  });
}

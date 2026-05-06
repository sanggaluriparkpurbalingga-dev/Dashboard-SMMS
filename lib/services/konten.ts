import { createClient } from '@/lib/supabase/client';
import { prisma } from '@/lib/prisma';

const supabase = createClient();

/**
 * Utility untuk serialize BigInt agar aman dikirim dari Server Action ke Client
 */
function serializeData(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export async function getKonten(workspaceId?: string | number) {
  const data = await prisma.konten.findMany({
    where: workspaceId ? { id_workspace: Number(workspaceId) } : undefined,
    include: {
      evaluasi: true
    }
  });

  return serializeData(data);
}

export async function createKonten(kontenData: any) {
  // Ambil sesi user yang sedang login secara otomatis di Backend
  const { data: { user } } = await supabase.auth.getUser();

  // Gabungkan payload dari Frontend dengan author_id
  const payload = {
    ...kontenData,
    ...(user && { author_id: user.id }), // Otomatis terisi jika user login
  };

  const data = await prisma.konten.create({
    data: payload
  });

  return serializeData(data);
}

export async function updateKonten(id: string | number, updates: any) {
  const data = await prisma.konten.update({
    where: { id_konten: Number(id) },
    data: {
      ...updates,
      updated_at: new Date(),
    }
  });

  return serializeData(data);
}

export async function deleteKonten(id: string | number) {
  await prisma.konten.delete({
    where: { id_konten: Number(id) }
  });
}

export async function getTopKonten(workspaceId: number, year: number, month: number, limit: number = 5) {
  const { data, error } = await supabase.rpc('get_top_konten_bulanan', {
    ws_id: workspaceId,
    target_year: year,
    target_month: month,
  });

  if (error) {
    console.error('Error fetching top konten:', error);
    throw error;
  }
  return data;
}

export async function getGrowth(workspaceId: number, year: number, month: number) {
  const { data, error } = await supabase.rpc('get_growth_views_bulanan', {
    ws_id: workspaceId,
    target_year: year,
    target_month: month,
  });

  if (error) {
    console.error('Error fetching growth:', error);
    throw error;
  }
  return data?.[0] || null;
}

// ==========================================
// FUNGSI STORAGE & UPLOAD UNTUK FRONTEND
// ==========================================

export async function uploadAsset(file: File, workspaceId: string | number) {
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('Tipe file tidak didukung. Mohon unggah gambar atau video.');
  }

  const MAX_SIZE_MB = 50;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Ukuran file terlalu besar. Maksimal pengunggahan adalah ${MAX_SIZE_MB}MB.`);
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${workspaceId}/${Date.now()}_${safeFileName}`;

  const { error } = await supabase.storage
    .from('konten-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error saat upload aset:', error);
    throw new Error(`Gagal mengunggah file: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('konten-media')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function saveKontenWithMedia(kontenData: any, file: File) {
  if (!kontenData.id_workspace) {
    throw new Error('Data gagal disimpan: id_workspace tidak ditemukan.');
  }

  try {
    const publicUrl = await uploadAsset(file, kontenData.id_workspace);

    const payload = {
      ...kontenData,
      link_konten: publicUrl
    };

    return await createKonten(payload);
  } catch (error) {
    throw error;
  }
}

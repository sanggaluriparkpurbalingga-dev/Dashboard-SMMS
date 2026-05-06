import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const month = searchParams.get('month'); // e.g., 'jan', 'feb', etc or 'all'
  const filterType = searchParams.get('filter'); // e.g., 'last_week' or 'all'

  try {
    let dateFilter = {};
    if (filterType === 'last_week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = {
        tanggal_evaluasi: {
          gte: lastWeek
        }
      };
    } else if (month && month !== 'all') {
      const monthMap: Record<string, number> = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };

      const monthIndex = monthMap[month.toLowerCase()];
      if (monthIndex !== undefined) {
        const year = new Date().getFullYear();
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0);

        dateFilter = {
          tanggal_evaluasi: {
            gte: startDate,
            lte: endDate
          }
        };
      }
    }

    const evaluasiData = await prisma.evaluasi.findMany({
      where: {
        ...(workspaceId ? {
          konten: {
            id_workspace: Number(workspaceId)
          }
        } : {}),
        ...dateFilter
      },
      include: {
        konten: {
          include: {
            workspace: true
          }
        }
      }
    });

    // Header CSV sesuai PRD
    let csvContent = "Nama Konten,Workspace,Pillar,Status Konten,Tanggal Upload,Tanggal Evaluasi,Views,Likes,Comment,Shares,Favorite,ER\n";

    evaluasiData.forEach((item) => {
      const namaKonten = item.konten?.nama_konten ? `"${item.konten.nama_konten.replace(/"/g, '""')}"` : '"Tanpa Judul"';
      const workspaceName = item.konten?.workspace?.nama_workspace || '-';
      const pillar = item.konten?.pillar || '-';
      const statusKonten = item.konten?.status_konten || '-';
      const tanggalUpload = item.konten?.tanggal_upload ? item.konten.tanggal_upload.toISOString().split('T')[0] : '-';
      const tanggalEvaluasi = item.tanggal_evaluasi ? item.tanggal_evaluasi.toISOString().split('T')[0] : '-';

      const views = item.total_views || 0;
      const likes = item.total_likes || 0;
      const comments = item.total_comment || 0;
      const shares = item.total_shares || 0;
      const favorites = item.total_favorites || 0;
      const er = item.nilai_er || 0;

      csvContent += `${namaKonten},${workspaceName},${pillar},${statusKonten},${tanggalUpload},${tanggalEvaluasi},${views},${likes},${comments},${shares},${favorites},${er}%\n`;
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="laporan-evaluasi-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Gagal menghasilkan laporan' }, { status: 500 });
  }
}

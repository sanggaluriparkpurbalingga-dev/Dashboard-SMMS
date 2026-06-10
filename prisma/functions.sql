-- ============================================================
-- FUNGSI: get_top_konten_bulanan
-- Digunakan oleh: getTopKonten() di lib/services/konten.ts
-- Mengembalikan top konten berdasarkan total views dalam bulan tertentu
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_top_konten_bulanan(
  ws_id BIGINT,
  target_year INT,
  target_month INT
)
RETURNS TABLE (
  id_konten      BIGINT,
  nama_konten    TEXT,
  jenis_konten   TEXT,
  pillar         TEXT,
  status_konten  TEXT,
  total_views    BIGINT,
  total_likes    BIGINT,
  total_comment  BIGINT,
  total_shares   BIGINT,
  total_favorites BIGINT,
  nilai_er       NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id_konten,
    k.nama_konten,
    k.jenis_konten,
    k.pillar::TEXT,
    k.status_konten::TEXT,
    COALESCE(SUM(e.total_views), 0)::BIGINT     AS total_views,
    COALESCE(SUM(e.total_likes), 0)::BIGINT     AS total_likes,
    COALESCE(SUM(e.total_comment), 0)::BIGINT   AS total_comment,
    COALESCE(SUM(e.total_shares), 0)::BIGINT    AS total_shares,
    COALESCE(SUM(e.total_favorites), 0)::BIGINT AS total_favorites,
    COALESCE(AVG(e.nilai_er), 0)::NUMERIC       AS nilai_er
  FROM konten k
  LEFT JOIN evaluasi e
    ON e.id_konten = k.id_konten
    AND EXTRACT(YEAR  FROM e.tanggal_evaluasi) = target_year
    AND EXTRACT(MONTH FROM e.tanggal_evaluasi) = target_month
  WHERE k.id_workspace = ws_id
  GROUP BY
    k.id_konten,
    k.nama_konten,
    k.jenis_konten,
    k.pillar,
    k.status_konten
  ORDER BY total_views DESC;
END;
$$;


-- ============================================================
-- FUNGSI: get_growth_views_bulanan
-- Digunakan oleh: getGrowth() di lib/services/konten.ts
-- Mengembalikan persentase growth views dibanding bulan sebelumnya
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_growth_views_bulanan(
  ws_id BIGINT,
  target_year INT,
  target_month INT
)
RETURNS TABLE (
  current_views   BIGINT,
  previous_views  BIGINT,
  growth_percent  NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  prev_year  INT;
  prev_month INT;
BEGIN
  -- Hitung bulan sebelumnya
  IF target_month = 1 THEN
    prev_month := 12;
    prev_year  := target_year - 1;
  ELSE
    prev_month := target_month - 1;
    prev_year  := target_year;
  END IF;

  RETURN QUERY
  WITH current_period AS (
    SELECT COALESCE(SUM(e.total_views), 0)::BIGINT AS views
    FROM evaluasi e
    JOIN konten k ON k.id_konten = e.id_konten
    WHERE k.id_workspace = ws_id
      AND EXTRACT(YEAR  FROM e.tanggal_evaluasi) = target_year
      AND EXTRACT(MONTH FROM e.tanggal_evaluasi) = target_month
  ),
  previous_period AS (
    SELECT COALESCE(SUM(e.total_views), 0)::BIGINT AS views
    FROM evaluasi e
    JOIN konten k ON k.id_konten = e.id_konten
    WHERE k.id_workspace = ws_id
      AND EXTRACT(YEAR  FROM e.tanggal_evaluasi) = prev_year
      AND EXTRACT(MONTH FROM e.tanggal_evaluasi) = prev_month
  )
  SELECT
    c.views AS current_views,
    p.views AS previous_views,
    CASE
      WHEN p.views = 0 THEN NULL
      ELSE ROUND(((c.views - p.views)::NUMERIC / p.views) * 100, 2)
    END AS growth_percent
  FROM current_period c, previous_period p;
END;
$$;

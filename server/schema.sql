-- DropRadar Production PostgreSQL & Supabase Database Schema
-- Provides titles catalog, release date history, news approval queue, and import telemetry

-- 1. Main Titles Catalog
CREATE TABLE IF NOT EXISTS titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL DEFAULT 'curated', -- 'tmdb', 'anilist', 'openlibrary', 'sheets', 'manual'
  source_id VARCHAR(100),
  name TEXT NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('Movies', 'Anime', 'Games', 'Dramas', 'Books', 'Manga')),
  release_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Tentative', 'Delayed')),
  platform TEXT NOT NULL DEFAULT 'Theatrical / Digital',
  tagline TEXT,
  description TEXT,
  poster_url TEXT,
  gradient TEXT DEFAULT 'from-[#ff3d71] via-[#8b5cf6] to-[#0b0d1a]',
  accent VARCHAR(20) DEFAULT '#ff3d71',
  popularity NUMERIC(10, 2) DEFAULT 0,
  locked BOOLEAN NOT NULL DEFAULT false, -- Never overwritten by automated fetcher jobs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_titles_source_source_id UNIQUE (source, source_id)
);

-- 2. Release Date Change & Delay History
CREATE TABLE IF NOT EXISTS release_date_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  title_name TEXT NOT NULL,
  old_date DATE NOT NULL,
  new_date DATE NOT NULL,
  reason TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI-Assisted News Approval Queue (Drafts -> Editor Review -> Published)
CREATE TABLE IF NOT EXISTS news_approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  original_headline TEXT,
  summary TEXT NOT NULL, -- 2-sentence concise summary
  source VARCHAR(100) NOT NULL,
  source_url TEXT,
  category VARCHAR(30) NOT NULL DEFAULT 'General',
  status VARCHAR(30) NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
  is_rumor BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  reviewed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- 4. Import & Sync Telemetry Logs
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  items_added INTEGER NOT NULL DEFAULT 0,
  items_updated INTEGER NOT NULL DEFAULT 0,
  date_changes_detected INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,
  error_details TEXT,
  triggered_by VARCHAR(50) NOT NULL DEFAULT 'scheduler'
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_titles_release_date ON titles(release_date);
CREATE INDEX IF NOT EXISTS idx_titles_category ON titles(category);
CREATE INDEX IF NOT EXISTS idx_titles_source ON titles(source);
CREATE INDEX IF NOT EXISTS idx_date_history_title ON release_date_history(title_id);
CREATE INDEX IF NOT EXISTS idx_news_approval_status ON news_approval_queue(status);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_titles_timestamp ON titles;
CREATE TRIGGER trigger_update_titles_timestamp
BEFORE UPDATE ON titles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 5. Row Level Security (RLS) Policies
-- Enables public read via SUPABASE_ANON_KEY while reserving write/delete for service_role
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_date_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public reads on titles & approved news
CREATE POLICY "Public read access for titles" ON titles FOR SELECT USING (true);
CREATE POLICY "Public read access for date history" ON release_date_history FOR SELECT USING (true);
CREATE POLICY "Public read access for approved news" ON news_approval_queue FOR SELECT USING (status = 'approved');

-- Allow service_role key full control on server / GitHub Actions importer
CREATE POLICY "Service role full access on titles" ON titles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on history" ON release_date_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on news" ON news_approval_queue FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on logs" ON import_logs FOR ALL USING (auth.role() = 'service_role');

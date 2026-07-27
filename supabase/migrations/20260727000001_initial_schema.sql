-- Migration: 20260727000001_initial_schema.sql
-- Description: Create base schema for Portfolio & Job Tracker (Wagner, Daiana, Aflora Espaço Criativo)

-- 1. Commercial Categories Table (N:N with Jobs)
CREATE TABLE IF NOT EXISTS public.commercial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Job Tags Table (N:N with Jobs)
CREATE TABLE IF NOT EXISTS public.job_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6b7280',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Dynamic Custom Field Definitions Table
CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
    options TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    client_name TEXT,
    performer TEXT NOT NULL CHECK (performer IN ('wagner', 'daiana', 'aflora', 'joint')),
    job_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location TEXT,
    drive_url TEXT,
    youtube_url TEXT,
    value NUMERIC(12,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'planned', 'in_progress', 'completed', 'cancelled')),
    description TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. N:N Junction Table: Jobs <-> Commercial Categories
CREATE TABLE IF NOT EXISTS public.job_commercial_categories (
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.commercial_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, category_id)
);

-- 6. N:N Junction Table: Jobs <-> Job Tags
CREATE TABLE IF NOT EXISTS public.job_tags_junction (
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.job_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, tag_id)
);

-- Indexes for optimal search performance
CREATE INDEX IF NOT EXISTS idx_jobs_performer ON public.jobs(performer);
CREATE INDEX IF NOT EXISTS idx_jobs_job_date ON public.jobs(job_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_custom_fields ON public.jobs USING gin (custom_fields);

-- Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.commercial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_commercial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tags_junction ENABLE ROW LEVEL SECURITY;

-- Allow public select/insert/update/delete for simple app usage
CREATE POLICY "Allow public access for commercial_categories" ON public.commercial_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for job_tags" ON public.job_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for custom_field_definitions" ON public.custom_field_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for job_commercial_categories" ON public.job_commercial_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for job_tags_junction" ON public.job_tags_junction FOR ALL USING (true) WITH CHECK (true);

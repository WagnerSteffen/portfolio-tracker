-- Migration: 20260729000001_reportage_links.sql
-- Description: Create reportage_links and junction table job_reportage_links

-- 1. Reportage Links Table
CREATE TABLE IF NOT EXISTS public.reportage_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    provider TEXT,
    published_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. N:N Junction Table: Jobs <-> Reportage Links
CREATE TABLE IF NOT EXISTS public.job_reportage_links (
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    link_id UUID REFERENCES public.reportage_links(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, link_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_reportage_links_job_id ON public.job_reportage_links(job_id);
CREATE INDEX IF NOT EXISTS idx_job_reportage_links_link_id ON public.job_reportage_links(link_id);

-- Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.reportage_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_reportage_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access for reportage_links" ON public.reportage_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for job_reportage_links" ON public.job_reportage_links FOR ALL USING (true) WITH CHECK (true);

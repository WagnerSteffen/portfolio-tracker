-- Migration: 20260729000003_job_clients_junction.sql
-- Description: Create job_clients junction table, migrate legacy jobs.client_name data to clients, and drop jobs.client_name

-- 1. Create N:N Junction Table: Jobs <-> Clients
CREATE TABLE IF NOT EXISTS public.job_clients (
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, client_id)
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_job_clients_job_id ON public.job_clients(job_id);
CREATE INDEX IF NOT EXISTS idx_job_clients_client_id ON public.job_clients(client_id);

-- Enable RLS & Public Access Policy for job_clients
ALTER TABLE public.job_clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'job_clients' AND policyname = 'Allow public access for job_clients'
    ) THEN
        CREATE POLICY "Allow public access for job_clients" ON public.job_clients FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 2 & 3. Dynamic Data Migration (if legacy client_name column still exists on jobs)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'client_name'
    ) THEN
        -- Insert missing client names
        EXECUTE '
            INSERT INTO public.clients (name)
            SELECT DISTINCT TRIM(client_name)
            FROM public.jobs
            WHERE client_name IS NOT NULL
              AND TRIM(client_name) <> ''''
              AND NOT EXISTS (
                  SELECT 1 FROM public.clients c WHERE LOWER(c.name) = LOWER(TRIM(public.jobs.client_name))
              )
        ';

        -- Populate job_clients junction
        EXECUTE '
            INSERT INTO public.job_clients (job_id, client_id)
            SELECT j.id, c.id
            FROM public.jobs j
            JOIN public.clients c ON LOWER(TRIM(j.client_name)) = LOWER(c.name)
            WHERE j.client_name IS NOT NULL AND TRIM(j.client_name) <> ''''
            ON CONFLICT (job_id, client_id) DO NOTHING
        ';

        -- Drop legacy column
        ALTER TABLE public.jobs DROP COLUMN IF EXISTS client_name;
    END IF;
END $$;

-- Migration: 20260729000002_clients.sql
-- Description: Create clients table for Portfolio & Job Tracker

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by name
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);

-- Enable Row Level Security (RLS) & Public Access Policy
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow public access for clients'
    ) THEN
        CREATE POLICY "Allow public access for clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

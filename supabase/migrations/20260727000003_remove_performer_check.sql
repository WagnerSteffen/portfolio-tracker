-- Migration: 20260727000003_remove_performer_check.sql
-- Description: Drop jobs_performer_check constraint to allow multi-select performer values (e.g., 'wagner,daiana')

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_performer_check;

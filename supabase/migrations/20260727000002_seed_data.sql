-- Migration: 20260727000002_seed_data.sql
-- Description: Seed initial categories, tags, dynamic fields, and sample jobs for Wagner, Daiana, and Aflora Espaço Criativo

-- Seed Commercial Categories
INSERT INTO public.commercial_categories (name, color) VALUES
    ('B2C', '#10b981'),
    ('B2B', '#3b82f6'),
    ('Projeto', '#8b5cf6'),
    ('Edital', '#f59e0b'),
    ('Institucional', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Seed Job Tags
INSERT INTO public.job_tags (name, color) VALUES
    ('Fotografia Ensaio', '#06b6d4'),
    ('Evento / Casamento', '#f43f5e'),
    ('Vídeo / Reel', '#a855f7'),
    ('Branding / Identidade', '#eab308'),
    ('Design Gráfico', '#3b82f6'),
    ('Oficina / Workshop', '#14b8a6')
ON CONFLICT (name) DO NOTHING;

-- Seed Custom Field Definitions
INSERT INTO public.custom_field_definitions (label, key, field_type, options) VALUES
    ('Câmera / Equipamento', 'camera_used', 'text', '{}'),
    ('Qtd. Fotos Entregues', 'delivered_photos', 'number', '{}'),
    ('Local do Acervo', 'storage_location', 'select', '{"HD Externo A", "HD Externo B", "Nuvem Drive"}')
ON CONFLICT (key) DO NOTHING;

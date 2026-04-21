-- Patch 001 — add missing anon INSERT policy on contacts
-- Run this in Supabase SQL Editor after resuming the project.
create policy "anon insert contacts" on contacts for insert with check (true);

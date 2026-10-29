-- MerryHub admin-only pack files.
-- Creates the PRIVATE storage bucket `admin-files` (public = false: no public
-- URLs exist for these files). The two pack PDFs are uploaded into it through
-- the Supabase dashboard (Storage -> admin-files). Downloads happen only via
-- GET /api/admin/files/<name>, which requires the signed-in admin and returns
-- a 2-minute signed URL minted with the service role.
insert into storage.buckets (id, name, public)
values ('admin-files', 'admin-files', false)
on conflict (id) do nothing;

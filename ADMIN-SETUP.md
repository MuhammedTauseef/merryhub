# MerryHub Blog — Admin Setup

The blog is database-backed (Supabase) with a small admin panel at
`/admin/login` → `/admin`. Until the steps below are done, the blog simply
shows an empty state and the rest of the site works as normal — nothing is
broken by the missing setup.

## Env contract

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Public reads (published posts only, RLS-enforced) + admin login session |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local, **server only** | Admin API writes, used only after the session + admin email are verified server-side |
| `ADMIN_EMAIL` | Vercel + local | The one admin email (comma-separated allowlist) |

## One-time setup

1. **Create (or pick) the Supabase project** for MerryHub and open its
   dashboard. Note the project URL and keys under *Project Settings → API*
   (`anon` public key and `service_role` secret key).
2. **Create the table:** in *SQL Editor*, paste and run the whole of
   [`supabase/blog.sql`](supabase/blog.sql). It creates `blog_posts`, turns
   on RLS (public may SELECT published posts only; all writes are
   service-role only), adds an `updated_at` trigger, and creates the
   **public `blog-images` storage bucket** that cover images are uploaded
   to. The file is idempotent — safe to re-run any time; on a database
   set up before cover images existed, re-running it is exactly how the
   `hero_image` column and the bucket get added.
3. **Create the admin user:** *Authentication → Users → Add user* — email =
   the address you will put in `ADMIN_EMAIL`, with a strong password.
   (Email confirmation can be set to auto-confirm for this single user.)
4. **Set the env vars** (table above) in the Vercel project
   (*Settings → Environment Variables*, Production) and, for local work, in
   `.env.local` (never commit that file).
5. **Redeploy once** so the new env vars are live. After that, publishing
   from the admin panel goes live on the blog within ~60 seconds — no
   redeploy needed per post.

## Using the panel

- Sign in at `/admin/login` with the admin email + password.
- `/admin` lists every post (drafts + published) with Edit / Delete / View.
- The editor: title, slug (auto-generated, editable), category, target
  keyword, excerpt (meta description, ≤160 chars), direct answer (40–60
  words), **cover image** (Upload / Replace / Remove — JPG, PNG or WebP up
  to 5 MB, uploaded to the `blog-images` bucket; it shows at the top of
  the article, as the blog-card thumbnail and as the share image),
  content in ONE field using the simple format (`## Heading` lines, plain
  paragraphs, `- ` bullets — the format is explained under the field),
  5 FAQ question/answer pairs, related links (`Label | /path` per line),
  and status. **Save draft** keeps it hidden; **Publish** makes it live
  (and sets its publish date the first time).
- Security model: every admin API call re-verifies the caller's Supabase
  session token and checks the email against `ADMIN_EMAIL` on the server,
  then writes via the service role. There are no admin links anywhere on
  the public site.

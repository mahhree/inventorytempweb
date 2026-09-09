# CardBerry TCG

A tiny site for showing off a graded card collection:

- `/` — public gallery. Filter by category (Pokemon, One Piece, Riftbound, Lorcana, ...) and grading
  company (PSA, Beckett, SGC, CGC, ...), search, sort.
- `/dashboard` — password-protected. Drag & drop a new CSV export to replace the whole collection,
  no code edits required. Also has a toggle to show/hide purchase price, current value, and profit
  on the public site (off by default).

No card photos yet — the CSV that was used to build this has no image column, so cards render as
text tiles for now. See "Adding photos later" below for how to wire that in when you're ready.

## Running it locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and set DASHBOARD_PASSWORD to something only you know
npm run dev
```

Visit `http://localhost:3000` for the gallery, and `http://localhost:3000/dashboard` to log in and
upload a CSV. Locally, uploaded data is stored in `data/cards.json` (gitignored) — nothing fancy.

## CSV format

The dashboard expects the same columns as your Card Ladder export:

```
Date Purchased, Quantity, Card, Subject, Year, Set, Variation, Number, Category,
Condition, Investment, Current Value, Potential Profit, Graded Cert #, Population, Notes
```

`Condition` (e.g. `PSA 9`, `CGC 9.5`, `SGC 10`) is automatically split into a grading company and a
grade — that's how the site knows which badge/color to show without a separate "grader" column. If
your export ever has extra or reordered columns that's fine, the parser matches by header name, not
position. If a required column (`Card`, `Category`, `Condition`) is missing entirely, the upload is
rejected with an error instead of silently uploading broken data.

## Deploying to cardberrytcg.com

1. **Push this code to a GitHub repo** (create a new empty repo, then `git init`, `git add -A`,
   `git commit`, `git remote add origin ...`, `git push`).
2. **Import the repo into Vercel** (vercel.com -> Add New -> Project -> pick the repo). Framework
   preset should auto-detect as Next.js.
3. **Add environment variables** in the Vercel project (Settings -> Environment Variables):
   - `DASHBOARD_PASSWORD` — the password you'll use to log into `/dashboard`.
   - (optional) `SESSION_SECRET` — any random long string.
4. **Enable Blob storage** so uploaded collections persist across deploys/serverless instances:
   Vercel project -> Storage tab -> Create Database -> Blob -> connect it to this project. Vercel
   injects `BLOB_READ_WRITE_TOKEN` automatically — you don't set it by hand. Without this step the
   app still runs, but every fresh deploy/serverless cold start would start with an empty
   collection, since there's no local disk to persist to on Vercel.
5. **Deploy.** Vercel will build and give you a `*.vercel.app` URL first — confirm the gallery and
   `/dashboard` work there.
6. **Point your domain at it**: Vercel project -> Settings -> Domains -> add `cardberrytcg.com` (and
   `www.cardberrytcg.com` if you want both). Vercel shows you the exact DNS records to add; go to
   wherever you registered the domain, add those records, and wait for DNS to propagate (usually
   minutes, sometimes longer).
7. Log into `https://cardberrytcg.com/dashboard` with your password and upload your CSV. Done —
   share `https://cardberrytcg.com` with people.

### Updating the collection later

Just log into `/dashboard` and drag in a fresher CSV export whenever your collection changes — no
redeploy, no code edits. It fully replaces the previous set of cards.

## Adding photos later (phase 2)

The data model already has an `imageUrl` field per card (see `lib/types.ts`) and the gallery/tile
component already knows how to show an image when one is present, falling back to the "No image
yet" placeholder otherwise. When you're ready, a natural next step is: add a photo upload control
per card row in `/dashboard` (using Vercel Blob's file upload, same storage already wired in), or
support a CSV column with a direct image URL if you end up hosting scans/photos somewhere. Either
way, no changes needed to the gallery itself — it already renders `card.imageUrl` if set.

## Tech notes

- Next.js 16 (App Router) + TypeScript + Tailwind, no database — the whole "collection" is one
  JSON blob (Vercel Blob storage in production, a local file in dev).
- Auth is a single shared password (yours), not a user system — appropriate for a personal
  collection site with one admin.
- Nothing here talks to PSA/CGC/etc APIs. Population/cert # etc. come straight from your CSV
  export as-is.

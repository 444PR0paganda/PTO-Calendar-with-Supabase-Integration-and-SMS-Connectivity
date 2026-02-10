This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1. Push this repo to GitHub (already done if you cloned from GitHub).
2. Go to [vercel.com/new](https://vercel.com/new), import this repository, and deploy.
3. In the Vercel project **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key
   - `MANAGER_PASSWORD` – password for the Management dashboard
   - `ADMIN_PASSWORD` – password for the Admin dashboard
4. Redeploy (or wait for the next push) so the new env vars are applied.

Employees sign in at **Request time off** with their full name (as added in Admin). Managers and admins use the passwords you set above.

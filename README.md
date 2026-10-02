# Satyam Gupta Portfolio

Personal portfolio built with Next.js, Framer Motion and Tailwind CSS.

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Where to edit

- Recent work: `app/_data/thumbnail-options.js`
- Research papers: `app/_data/research-papers.js`
- Social links: `app/_data/social-medias.js`
- Site title and SEO: `app/_config/metadata.config.js`

Set `NEXT_PUBLIC_SITE_URL` to your live domain when you deploy.

## Deploy on Vercel

1. Push this project to GitHub (`node_modules` and `.next` are git ignored).
2. On vercel.com choose Add New, Project, import the repo, then Deploy.
3. Optional: add your custom domain under Settings, Domains, and set
   `NEXT_PUBLIC_SITE_URL` (for example `https://yourname.com`) under
   Settings, Environment Variables, then redeploy.

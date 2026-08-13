/* ============================================================
   Where the site lives
   ------------------------------------------------------------
   One definition, read from three places: the metadata in
   app/layout.jsx, app/robots.js and app/sitemap.js. All three
   have to name the same origin — a sitemap listing one host
   while the canonical link names another is worse than having
   neither, because it tells a crawler the two disagree.

   This was `https://aaizahmad.dev`, which has no DNS record.
   Nothing pointed at it, so every absolute URL the metadata
   generated — og:url, the canonical link, the sitemap entries —
   referred to a host that does not answer, and any link preview
   built from them resolved to nothing.

   If a custom domain is ever pointed at this project, change it
   here and the three follow.
   ============================================================ */

export const SITE_URL = 'https://portfolio-aaiz.vercel.app';

import { SITE_URL } from '@/lib/site';

/* The metadata object in layout.jsx already emits <meta name="robots">, which
   is the instruction a crawler reads once it has the page. This is the one it
   reads before deciding to ask for the page at all, and it is also where the
   sitemap is advertised — there is nowhere else to declare it.
   Everything here is public, so nothing is disallowed. */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

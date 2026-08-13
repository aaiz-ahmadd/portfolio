import { SITE_URL } from '@/lib/site';

/* One page, so one entry. It is worth having anyway: it is what robots.txt
   points at, and it carries lastModified, which is the only machine-readable
   signal that the page changed at all — a single-page site has no other way to
   say so.

   The sections are anchors on this page rather than routes, so they are
   deliberately not listed. A crawler treats /#work as the same URL as /, and
   listing fragments as separate entries makes a sitemap that disagrees with
   the canonical link in layout.jsx. If a section ever becomes a real route,
   it belongs here. */
export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}

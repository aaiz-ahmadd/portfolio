import localFont from 'next/font/local';
import { profile } from '@/lib/content';
import { FRAME_TIERS, framePath } from '@/lib/frames';
import { PORTRAIT_TIERS, portraitPath } from '@/lib/portrait';
import { NO_FLASH } from '@/lib/theme';
import { SITE_URL } from '@/lib/site';
import './globals.css';

/* Type chosen against the footage rather than by default.

   The render is already doing the beautiful work — brass, light, depth. If the
   display face also reached for beauty the two would compete for the same job,
   so it does the opposite one: Archivo is an industrial grotesque with no
   decorative tics, and set enormous and tight it reads as structure against the
   light. That is the right counterpoint, and it keeps the page reading as
   engineering, which is what is being sold.
   (It replaces Bricolage Grotesque, whose deliberate wobble suited the softer
   sequence this design grew out of and fights the precision of this one.)

   Schibsted Grotesk stays as the body face — warm, high x-height, and already
   proven legible on top of moving footage here.

   JetBrains Mono carries every label, index and part number. It is the font he
   actually writes code in, which makes it honest rather than decorative, and
   it is what lets the metadata read as a drawing annotation.

   All three are self-hosted from app/fonts/ rather than pulled with
   next/font/google. The Google loader downloads the files at *build* time, so
   a builder that cannot reach fonts.gstatic.com fails the whole build rather
   than falling back — which is exactly what happened on the first deploy. The
   files are the latin subset of each variable font, so a single file per family
   covers every weight the page sets, and they are served from this origin
   instead of a third party. */

const display = localFont({
  src: './fonts/Archivo-Variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-display',
  display: 'swap',
});

const body = localFont({
  src: './fonts/SchibstedGrotesk-Variable.woff2',
  weight: '400 900',
  style: 'normal',
  variable: '--font-body',
  display: 'swap',
});

const mono = localFont({
  src: './fonts/JetBrainsMono-Variable.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono',
  display: 'swap',
});

/* The card image, shared by Open Graph and Twitter. Frame 34 of the sequence —
   the machine open, brass either side, symmetrical. It is chosen to survive
   being small: a link preview is a thumbnail, and the burst frames that open
   and close the run are mostly dark field with a blown centre, which reads as
   an empty rectangle at that size. This one still reads as a machine.

   Declaring it is not optional given the card type below. `summary_large_image`
   promises an image; without one, X and LinkedIn render an empty panel with the
   title crammed under it, which looks worse than having claimed nothing. The
   two have to agree, and now they do. */
const OG_IMAGE = {
  url: '/og.jpg',
  width: 1200,
  height: 630,
  alt: 'A brass and machined-aluminium device, opened to show the optics and boards inside it.',
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${profile.name} — ${profile.role}`,
  description:
    'Full-stack developer in Lahore. MERN, React and GSAP. BS Computer Science at Information Technology University.',
  keywords: ['Aaiz Ahmad', 'full-stack developer', 'React', 'MERN', 'GSAP', 'Lahore', 'ITU'],
  authors: [{ name: profile.name, url: profile.github }],
  alternates: { canonical: '/' },
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description: 'Full-stack developer in Lahore. MERN, React and GSAP.',
    url: '/',
    siteName: profile.name,
    type: 'profile',
    locale: 'en_US',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${profile.name} — ${profile.role}`,
    description: 'Full-stack developer in Lahore. MERN, React and GSAP.',
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: '#051009',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // let the page reach under the iPhone notch
};

export default function RootLayout({ children }) {
  return (
    /* suppressHydrationWarning is scoped to <html> and <body> on purpose.
       It suppresses attribute diffs on these two tags only — never on their
       children — and nothing rendered here is client-dependent, so the only
       diffs it can hide are the ones we don't own. Mobile browsers routinely
       write to the outer tags before React hydrates: reader/dark modes and the
       AI-assistant browsers add their own classes to <html>, and translation
       and password managers add attributes to <body>. Without this, that
       rewrite lands as a hydration error on a real phone and nowhere else. */
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Frame 1 is the hero backdrop — fetch it with the document. One link
            per tier, each scoped to the same media query the loader picks with,
            so exactly the tier that gets painted is the tier that gets
            preloaded. See lib/frames.js. */}
        {FRAME_TIERS.map(({ tier, media }) => (
          <link
            key={tier}
            rel="preload"
            as="image"
            href={framePath(tier, 0)}
            type="image/webp"
            media={media}
          />
        ))}
        {/* The portrait's first frame, on the same terms. It is the card's
            resting state; the other 24 wait until the section is near — see
            Portrait.jsx. */}
        {PORTRAIT_TIERS.map(({ tier, media }) => (
          <link
            key={`portrait-${tier}`}
            rel="preload"
            as="image"
            href={portraitPath(tier, 0)}
            type="image/webp"
            media={media}
          />
        ))}
        {/* Applies a stored dimmer preference before the first paint. It has to
            be inline and synchronous — see lib/theme.js for why deferring it
            costs a frame of the wrong palette. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        {/* Reveals start at opacity 0 and GSAP lifts them. With no JS that
            never happens, so the page would render blank. Undo it — drop the
            portrait, whose canvas nothing would ever paint into, and the
            dimmer, which is a button with nothing behind it. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}.loader{display:none!important}.portrait{display:none!important}.dimmer{display:none!important}`}</style>
        </noscript>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

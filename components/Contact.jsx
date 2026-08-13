import Figure from '@/components/Figure';
import { contact, profile, sections } from '@/lib/content';

const meta = sections.find((s) => s.id === 'contact');

const links = [
  { label: 'GitHub', value: 'aaiz-ahmadd', href: profile.github },
  { label: 'LinkedIn', value: 'Aaiz Ahmad', href: profile.linkedin },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
];

/**
 * 05 — the device reassembles and lights again.
 *
 * Side luminance falls to ~60 and comes back to ~92, so this returns to
 * floating type. The page opens back out exactly as the footage does, and the
 * run ends where it started.
 */
export default function Contact() {
  return (
    <section id="contact" className="section section--tall contact plane">
      <div className="side-l">
        <Figure mark={meta.figure} name={meta.label} />

        <h2 className="contact-lede reveal" data-from="l">
          {contact.lede}
        </h2>

        <p className="contact-note reveal" data-from="l">
          {contact.note}
        </p>

        <a className="contact-mail reveal" data-from="l" data-cursor="Email" href={`mailto:${profile.email}`}>
          {profile.email}
          <span className="work-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>

      <div className="side-r contact-links">
        {links.map((l) => (
          <a
            className="contact-link reveal"
            data-from="r"
            data-cursor={l.label === 'Phone' ? 'Call' : l.label}
            href={l.href}
            key={l.label}
            {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          >
            <span>{l.label}</span>
            <b>{l.value}</b>
          </a>
        ))}
      </div>

      <footer className="colophon reveal">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Built with Next.js, GSAP and a hundred rendered frames</span>
        <span>{profile.location}</span>
      </footer>
    </section>
  );
}

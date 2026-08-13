// Single source of truth for everything on the page.
// Edit this file to update the site — no component changes needed.

export const profile = {
  name: 'Aaiz Ahmad',
  first: 'Aaiz',
  last: 'Ahmad',
  role: 'Full-Stack Web Developer',
  location: 'Lahore, Pakistan',
  email: 'aaiz.ahmadd@gmail.com',
  phone: '+92 310 1661444',
  linkedin: 'https://www.linkedin.com/in/aaiz-ahmad-a045b6324/',
  github: 'https://github.com/aaiz-ahmadd',
};

/* The hero name is set as two lines rather than one wrapped string so the
   opening animation can move them independently, and so the break never
   lands somewhere the browser chose. */
export const heroLines = [profile.first, profile.last];

/* Deliberately shorter than `${role} — ${location}`. Set in mono at 0.14em
   tracking, the full version measures ~334px, and the text column on a 375px
   phone is 334px — so it landed exactly on the boundary and broke as
   "LAHORE, / PAKISTAN". This fits one line down to 360px. */
export const heroEyebrow = 'Full-stack developer — Lahore, PK';

/* Deliberately does not repeat the eyebrow above it, which already carries the
   role and the city. Four facts that are not written anywhere else on the
   first screen. */
export const heroMeta = [
  { label: 'Studying', value: 'BS Computer Science, ITU' },
  { label: 'Working in', value: 'React, Node, MongoDB' },
  { label: 'Recently', value: 'Softec hackathon, FAST' },
  { label: 'Status', value: 'Open to internships' },
];

/* Written in the first person and kept short on purpose. This sits beside the
   sealed orb, at the quietest point in the footage — it is the one place on
   the page that is allowed to just be a person talking. */
export const about = {
  lede: 'I build for the web, end to end.',
  body: [
    'I am a computer science student in Lahore, two semesters in, and most of what I actually know came from taking things apart — a working app, someone else’s repository, a bug I could not explain — and not stopping until I could follow the whole path from the click to the database and back.',
    'So I build the whole path. Auth, schema, the routes between them, and a front end that does not fall over when the network does. I would rather ship something small that holds up than something large that only demos.',
  ],
};

export const education = [
  {
    school: 'Information Technology University',
    abbr: 'ITU',
    credential: 'BS Computer Science',
    place: 'Lahore, Pakistan',
    from: 'Aug 2025',
    to: 'Jul 2029',
    metricLabel: 'CGPA',
    metric: '3.16',
    status: 'current',
    note: 'Currently in the second semester.',
  },
  {
    school: 'KIPS College',
    abbr: 'KIPS',
    credential: 'ICS — Intermediate',
    place: 'Sheikhupura, Pakistan',
    from: 'Mar 2023',
    to: 'Apr 2025',
    metricLabel: 'Score',
    metric: '85%',
    status: 'done',
    note: 'Pre-engineering with computer science.',
  },
  {
    school: 'District Public School',
    abbr: 'DPS',
    credential: 'Computer Science — Matriculation',
    place: 'Sheikhupura, Pakistan',
    from: 'Mar 2021',
    to: 'Feb 2023',
    metricLabel: 'Score',
    metric: '93%',
    status: 'done',
    note: 'Where the first line of C++ happened.',
  },
];

/* Ordered by how close each group is to the work rather than alphabetically —
   the list is read as a parts inventory, so the load-bearing parts come first. */
export const skills = [
  {
    group: 'Languages',
    note: 'C++ first, JavaScript daily.',
    items: ['JavaScript', 'C++', 'Python', 'HTML', 'CSS'],
  },
  {
    group: 'Frameworks',
    note: 'React for the front, Express behind it.',
    items: ['React', 'Node.js', 'Express', 'Tailwind CSS', 'GSAP'],
  },
  {
    group: 'Data',
    note: 'Mongoose schemas, and enough SQL to reason about joins.',
    items: ['MongoDB', 'Mongoose', 'SQL'],
  },
  {
    group: 'Tooling',
    note: 'Git properly — branches, not just commits.',
    items: ['Git', 'GitHub', 'Vite', 'VS Code', 'Claude Code', 'Cursor'],
  },
];

export const projects = [
  {
    name: 'Spotify MERN Clone',
    year: '2025',
    href: 'https://github.com/aaiz-ahmadd/Spotify-MERN-Clone',
    summary:
      'A full streaming app with cookie-based JWT auth, bcrypt password hashing, and role-based access so artists can upload their own tracks.',
    detail:
      'Layered Express 5 and Mongoose backend behind a React 19 front end. Audio and cover art upload through Multer to ImageKit.',
    stack: ['React 19', 'Express 5', 'MongoDB', 'JWT', 'Vite'],
    kind: 'Full-stack',
  },
  {
    name: 'Gumaan AI',
    year: '2025',
    href: 'https://github.com/ubaidAhmad07/Gumaan_AI',
    summary:
      'An opportunity finder that reads listings with an LLM and sorts the real scholarships and internships from the noise.',
    detail:
      'Built at the Softec hackathon at FAST University — three people, in my first semester. Classification runs on Llama 3.3 70B through Groq, with PDF and Excel export.',
    stack: ['React 18', 'Groq API', 'Llama 3.3 70B', 'Context API'],
    kind: 'AI',
    highlight: 'Hackathon',
  },
  {
    name: 'Mini EMS',
    year: '2025',
    href: 'https://github.com/aaiz-ahmadd/mini-ems',
    summary:
      'Employee management with separate Admin and Employee views and a task status workflow that moves work between them.',
    detail: 'State persists to localStorage — a deliberate stand-in while the backend gets built.',
    stack: ['React 19', 'Tailwind CSS', 'Vite'],
    kind: 'Front-end',
  },
  {
    name: 'Countries Explorer',
    year: '2024',
    href: 'https://github.com/aaiz-ahmadd/Countries-Explorer',
    summary:
      'Search and filter every country in the world against a live REST API, with error handling that survives a dropped connection.',
    detail: 'No framework and no build step — the Fetch API and hand-written DOM work.',
    stack: ['Vanilla JS', 'Fetch API', 'HTML', 'CSS'],
    kind: 'Front-end',
  },
  {
    name: 'Employee React UI',
    year: '2024',
    href: 'https://github.com/aaiz-ahmadd/Employee-React-UI',
    summary:
      'A customer segmentation dashboard rendered entirely from data, through an eight-level component hierarchy.',
    detail: 'An exercise in prop flow and composition at a depth where sloppy state design starts to hurt.',
    stack: ['React 19', 'Tailwind CSS v4', 'Vite'],
    kind: 'Front-end',
  },
];

export const certifications = [
  { name: 'Full-Stack Web Developer', issuer: 'Coursera' },
  {
    name: 'Python Data Structures',
    issuer: 'Coursera',
    href: 'https://coursera.org/share/04a5477bb1d532f5007074398b7e4cb6',
  },
  {
    name: 'Getting Started with Python',
    issuer: 'Coursera',
    href: 'https://coursera.org/share/0369db3c6ab076b810938f0a79abf284',
  },
];

export const contact = {
  lede: 'If you are building something,\nI would like to hear about it.',
  note: 'Open to internships and junior full-stack roles, remote or in Lahore. I answer email quickly.',
};

/* The index down the left edge, and the order the page is assembled in.
   `figure` is the drawing reference each section carries — it is what ties the
   layout to the footage running behind it, and the frame band is noted here so
   the mapping is written down somewhere rather than living in someone's head.

     00 hero       1-20    the burst, settling
     01 approach  20-32    the sealed orb, the darkest and quietest stretch
     02 education 32-48    it opens
     03 stack     48-66    the components, laid out
     04 work      66-88    deepest interior, then reassembly
     05 contact   88-100   re-ignition */
export const sections = [
  { id: 'hero', index: '00', label: 'Start', figure: 'FIG. 00' },
  { id: 'approach', index: '01', label: 'Approach', figure: 'FIG. 01' },
  { id: 'education', index: '02', label: 'Education', figure: 'FIG. 02' },
  { id: 'stack', index: '03', label: 'Stack', figure: 'FIG. 03' },
  { id: 'work', index: '04', label: 'Work', figure: 'FIG. 04' },
  { id: 'contact', index: '05', label: 'Contact', figure: 'FIG. 05' },
];

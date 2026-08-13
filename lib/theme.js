/* ============================================================
   Dimmer state
   ------------------------------------------------------------
   One definition, read from three places: the blocking script
   in app/layout.jsx (before first paint), the control in
   components/Dimmer.jsx, and the CSS via [data-theme] on the
   root element.

   The page always opens undimmed. prefers-color-scheme is
   deliberately not consulted: this site has one palette rather
   than a light and a dark theme, so the OS setting is answering
   a question it was never asked here — and the undimmed page is
   the composition the whole thing was built and graded around.
   It is what a first-time visitor should meet. The dimmer is an
   option offered on top of it, not a second theme the device
   picks between.

   Two stored states, and the key's absence is the third:

     nothing stored  -> undimmed, the page as designed
     'deep'          -> dimmed
     'light'         -> undimmed, chosen rather than defaulted

   'light' is redundant against an absent key today and is
   written anyway, so the store says which visitors actually
   reached for the control. Nothing branches on the difference —
   if something ever needs to, the signal is already there.
   ============================================================ */

export const THEME_KEY = 'aa-dimmer';
export const DEEP = 'deep';
export const LIGHT = 'light';

/* The browser's own chrome — iOS paints the status bar with this, and Android
   the task switcher. It is the one surface the stylesheet can't reach, so it
   has to be moved by hand on every change. Both values are the --ink of their
   mode; if either changes in globals.css, it changes here too. */
export const THEME_COLOR = {
  [LIGHT]: '#051009',
  [DEEP]: '#020805',
};

/* Runs in <head> as its own synchronous script, before the first paint.
   Anything deferred — including waiting for React to hydrate — paints the
   undimmed page for a frame and then swaps, which is the flash this exists to
   prevent for the visitors who chose dimmed.

   try/catch because localStorage does not merely return null when it is
   unavailable: Safari's private mode throws on access, and so do some
   cookie-blocked Android builds. An unreadable preference should open the page
   in its default state, not stop the document parsing. */
export const NO_FLASH =
  `try{if(localStorage.getItem('${THEME_KEY}')==='${DEEP}')` +
  `document.documentElement.dataset.theme='${DEEP}'}catch(e){}`;

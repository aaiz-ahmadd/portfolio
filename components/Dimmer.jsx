'use client';

import { useEffect, useState } from 'react';
import { DEEP, LIGHT, THEME_COLOR, THEME_KEY } from '@/lib/theme';

/* Everything that has to move when the mode changes, in one place, because it
   is called from two: the mount sync and the toggle.

   The browser chrome is the reason this isn't just a one-line attribute set.
   It is the one surface the stylesheet cannot reach, and it has to be moved on
   both paths — a visitor arriving with 'deep' stored never touches the
   control, and if only the click handler did this their status bar would sit
   on the undimmed ink over a dimmed page. Deliberately not folded into the
   blocking script in layout.jsx: that runs inside <head> and is not guaranteed
   to have the viewport meta parsed yet. */
function applyTheme(deep) {
  const root = document.documentElement;
  if (deep) root.dataset.theme = DEEP;
  else delete root.dataset.theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', deep ? THEME_COLOR[DEEP] : THEME_COLOR[LIGHT]);
}

/**
 * The page's one control. Takes the room down without touching the brass.
 *
 * Deliberately not a light/dark switch in the theming sense: this site has one
 * palette and no light variant, so the two states are exposure levels — LIGHT
 * and DIM — rather than two themes. That is also why it ignores the OS colour
 * scheme: the undimmed page is the composition everything was graded against,
 * and it is what every visitor should meet first. See lib/theme.js.
 *
 * The control is drawn as a fill sliding down a track rather than a knob
 * flipping between ends, because that is the difference between a dimmer and a
 * switch and the motion should argue for the right one.
 */
export default function Dimmer() {
  /* Starts false on the server and on the first client render alike, so the
     hydrated tree matches the markup exactly. The real value lands in the
     effect below — and nothing moves when it does, because every pixel of this
     control is drawn from [data-theme] on the root, which the blocking script
     in layout.jsx has already set. This state feeds aria-checked and nothing
     else, so it is free to arrive a tick late. */
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    /* Read the attribute back rather than re-deriving it from storage. The
       head script has already decided, and duplicating that decision here is
       how the two drift apart. */
    const current = document.documentElement.dataset.theme === DEEP;
    setDeep(current);
    applyTheme(current);
  }, []);

  const toggle = () => {
    const next = !deep;
    setDeep(next);
    applyTheme(next);

    /* Writes a value in both directions rather than deleting the key for the
       undimmed one. Nothing branches on 'light' versus an absent key today —
       it records that this visitor chose, which an absent key cannot say. A
       browser that refuses storage still toggles for this visit; it just
       won't remember. */
    try {
      localStorage.setItem(THEME_KEY, next ? DEEP : LIGHT);
    } catch {
      /* storage unavailable — the mode still applies, it just won't persist */
    }
  };

  return (
    <button
      type="button"
      className="dimmer"
      role="switch"
      aria-checked={deep}
      data-cursor="Dim / Light"
      /* Named on the element rather than by its visible text, for two reasons:
         the label is display:none below 900px, which would take it out of the
         accessibility tree along with the button's only name — and the visible
         text reads the current state, which is the one thing an accessible
         name must not do. A switch announces its state from aria-checked; a
         name that changed with it would have screen readers saying "light,
         switch, off". The name stays put and describes the control. */
      aria-label="Dim"
      onClick={toggle}
    >
      {/* Both readings are always present and cross-faded in CSS off
          [data-theme]. Stacked in one grid cell so the control keeps a single
          height whichever word is showing. aria-hidden because the switch role
          already carries this state, and reading it twice is noise. */}
      <span className="dimmer-label" aria-hidden="true">
        <i data-cap="a">Light</i>
        <i data-cap="b">Dim</i>
      </span>
      <span className="dimmer-track" aria-hidden="true">
        <i className="dimmer-fill" />
      </span>
    </button>
  );
}

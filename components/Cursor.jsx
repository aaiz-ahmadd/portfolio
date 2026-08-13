'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Interactive Hover Bubble Cursor Component.
 *
 * Smoothly tracks the mouse cursor with GSAP hardware-accelerated transforms.
 * On hover over interactive elements or elements with data-cursor, the cursor
 * expands into a circular bubble displaying the target label in the center,
 * with the mouse cursor positioned precisely at the center of the circle bubble.
 */
export default function Cursor() {
  const cursorRef = useRef(null);
  const bubbleRef = useRef(null);
  const textRef = useRef(null);
  const dotRef = useRef(null);

  const [cursorText, setCursorText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run for devices with fine pointer (mouse/trackpad)
    if (typeof window === 'undefined') return;
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasPointer) return;

    const cursor = cursorRef.current;
    const bubble = bubbleRef.current;
    const dot = dotRef.current;
    const textEl = textRef.current;
    if (!cursor || !bubble || !dot) return;

    // Fast quickTo setters for 120fps tracking without layout thrashing
    const setX = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3.out' });
    const setY = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3.out' });

    let currentLabel = '';
    let isHovering = false;

    // Helper to find the appropriate cursor label for any element
    const resolveCursorLabel = (target) => {
      if (!target || !(target instanceof Element)) return null;

      // 1. Explicit data-cursor attribute on target or closest ancestor
      const explicitEl = target.closest('[data-cursor]');
      if (explicitEl) {
        const val = explicitEl.getAttribute('data-cursor');
        if (val === 'none' || val === 'false') return null;
        if (val && val.trim()) return val.trim();
      }

      // 2. Information Technology University checks
      const textContent = target.textContent || '';
      if (textContent.includes('Information Technology University') || target.closest('.edu-item[data-status="current"]')) {
        return 'ITU';
      }

      // 3. Link heuristics
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href') || '';
        if (href.includes('github.com')) return 'GitHub';
        if (href.includes('linkedin.com')) return 'LinkedIn';
        if (href.startsWith('mailto:')) return 'Email';
        if (href.startsWith('tel:')) return 'Call';
        if (href.includes('coursera.org')) return 'Coursera';
        if (anchor.classList.contains('work-card')) {
          const nameEl = anchor.querySelector('.work-name');
          return nameEl ? nameEl.textContent.replace('↗', '').trim() : 'View';
        }
        if (anchor.classList.contains('idx-item')) {
          const labelEl = anchor.querySelector('.idx-label');
          return labelEl ? labelEl.textContent.trim() : 'Jump';
        }
        if (anchor.classList.contains('cert')) {
          return 'Verify';
        }
        const aria = anchor.getAttribute('aria-label');
        if (aria) return aria;
        return 'Open';
      }

      // 4. Button heuristics
      const button = target.closest('button');
      if (button) {
        if (button.classList.contains('dimmer')) return 'Dim';
        const aria = button.getAttribute('aria-label');
        if (aria) return aria;
        return 'Click';
      }

      // 5. Portrait
      if (target.closest('.portrait')) {
        return 'Aaiz :)';
      }

      return null;
    };

    const onPointerMove = (e) => {
      setX(e.clientX);
      setY(e.clientY);

      if (!isVisible) {
        setIsVisible(true);
        gsap.to(cursor, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      }
    };

    const onPointerOver = (e) => {
      const label = resolveCursorLabel(e.target);
      if (label) {
        currentLabel = label;
        setCursorText(label);
        setIsActive(true);
        isHovering = true;

        // Smooth bubble expansion
        gsap.to(bubble, {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: 'back.out(1.6)',
          overwrite: 'auto',
        });

        // Subtly reduce central dot intensity when bubble expands
        gsap.to(dot, {
          scale: 0.5,
          opacity: 0.6,
          duration: 0.25,
          overwrite: 'auto',
        });
      }
    };

    const onPointerOut = (e) => {
      // Check if we are still over an element with a valid label
      const nextTarget = e.relatedTarget;
      const nextLabel = resolveCursorLabel(nextTarget);

      if (nextLabel) {
        if (nextLabel !== currentLabel) {
          currentLabel = nextLabel;
          setCursorText(nextLabel);
        }
      } else {
        isHovering = false;
        currentLabel = '';
        setIsActive(false);

        // Retract bubble back to resting dot
        gsap.to(bubble, {
          scale: 0,
          opacity: 0,
          duration: 0.28,
          ease: 'power3.inOut',
          overwrite: 'auto',
          onComplete: () => {
            if (!isHovering) setCursorText('');
          },
        });

        gsap.to(dot, {
          scale: 1,
          opacity: 1,
          duration: 0.25,
          overwrite: 'auto',
        });
      }
    };

    const onPointerLeaveWindow = () => {
      setIsVisible(false);
      gsap.to(cursor, { opacity: 0, duration: 0.25, ease: 'power2.out' });
    };

    const onPointerEnterWindow = () => {
      setIsVisible(true);
      gsap.to(cursor, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseover', onPointerOver, { passive: true });
    document.addEventListener('mouseout', onPointerOut, { passive: true });
    document.documentElement.addEventListener('mouseleave', onPointerLeaveWindow);
    document.documentElement.addEventListener('mouseenter', onPointerEnterWindow);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseover', onPointerOver);
      document.removeEventListener('mouseout', onPointerOut);
      document.documentElement.removeEventListener('mouseleave', onPointerLeaveWindow);
      document.documentElement.removeEventListener('mouseenter', onPointerEnterWindow);
    };
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className="cursor-bubble-container"
      data-active={isActive ? 'true' : 'false'}
      aria-hidden="true"
    >
      {/* Central precision dot positioned exactly at pointer coordinates */}
      <div ref={dotRef} className="cursor-bubble-dot" />

      {/* Expanded circular hover bubble with centered text */}
      <div ref={bubbleRef} className="cursor-bubble">
        <span ref={textRef} className="cursor-bubble-text">
          {cursorText}
        </span>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./HeroCarousel.module.css";

export type Slide = { src: string; alt: string; caption: string };

// Scroll-snap nativo: el swipe en mobile no necesita JS. Los botones solo mueven el scroll.
// Sin autoplay a propósito (WCAG 2.2.2 exigiría botón de pausa).
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = slides.length;

  const go = (to: number) => {
    const el = track.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: ((to + n) % n) * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className={styles.carousel} aria-roledescription="carrusel" aria-label="Ambientes Deconova">
      <div
        ref={track}
        className={styles.track}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {slides.map((s, j) => (
          <figure
            key={s.src}
            className={styles.slide}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${j + 1} de ${n}: ${s.caption}`}
            aria-hidden={j !== i}
          >
            <Image src={s.src} alt={s.alt} width={1200} height={800} preload={j === 0} className={styles.img} />
            <figcaption className={styles.caption}>{s.caption}</figcaption>
          </figure>
        ))}
      </div>
      <button type="button" className={styles.prev} onClick={() => go(i - 1)} aria-label="Ambiente anterior">‹</button>
      <button type="button" className={styles.next} onClick={() => go(i + 1)} aria-label="Ambiente siguiente">›</button>
      <div className={styles.dots}>
        {slides.map((s, j) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(j)}
            aria-label={`Ver ambiente ${j + 1}: ${s.caption}`}
            aria-current={j === i}
          />
        ))}
      </div>
    </section>
  );
}

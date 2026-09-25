"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./Gallery.module.css";

// Degrada sola: con 1 imagen no hay controles, con 2+ hay flechas y miniaturas.
export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: number) => setI((i + d + n) % n);

  return (
    <section aria-label={`Fotos de ${alt}`} aria-roledescription="galería">
      <div className={styles.stage}>
        <Image
          src={images[i]}
          alt={`${alt} — foto ${i + 1} de ${n}`}
          width={800}
          height={600}
          sizes="(min-width: 48rem) 60vw, 100vw"
          preload
          className={styles.main}
        />
        {n > 1 && (
          <>
            <button type="button" className={styles.prev} onClick={() => go(-1)} aria-label="Foto anterior">‹</button>
            <button type="button" className={styles.next} onClick={() => go(1)} aria-label="Foto siguiente">›</button>
          </>
        )}
      </div>
      {n > 1 && (
        <ul className={styles.thumbs}>
          {images.map((src, j) => (
            <li key={src}>
              <button type="button" onClick={() => setI(j)} aria-label={`Ver foto ${j + 1}`} aria-current={j === i}>
                <Image src={src} alt="" width={160} height={120} sizes="6rem" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

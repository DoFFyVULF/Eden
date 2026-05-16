"use client";

import { useId } from "react";
import styles from "./ConsentCheckbox.module.css";

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  caption?: string;
}

export default function ConsentCheckbox({
  checked,
  onChange,
  title,
  caption,
}: ConsentCheckboxProps) {
  const inputId = useId();

  return (
    <div className={styles.wrapper}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={styles.input}
      />
      <label htmlFor={inputId} className={styles.label}>
        <span className={styles.box} aria-hidden="true">
          <svg
            className={styles.svg}
            viewBox="0 0 95 95"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              className={styles.rect}
              x="30"
              y="20"
              width="50"
              height="50"
            />
            <g transform="translate(0,-952.36222)">
              <path
                className={styles.path}
                d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4"
              />
            </g>
          </svg>
        </span>

        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {caption ? <span className={styles.caption}>{caption}</span> : null}
        </span>
      </label>
    </div>
  );
}

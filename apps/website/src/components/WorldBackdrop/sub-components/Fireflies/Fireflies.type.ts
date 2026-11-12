/* @layer website-site @kind types */
import type { CSSProperties } from 'react';

type FireflyHue = 'gold' | 'cream' | 'amber' | 'ember';

type Firefly = {
  x: number;
  y: number;
  size: number;
  hue: FireflyHue;
  drift: number;
  flicker: number;
  delay: number;
};

type FireflyStyle = {
  key: string;
  hue: FireflyHue;
  style: CSSProperties;
};

export type { Firefly, FireflyStyle };

/* @layer renderer-app @kind types */
import type { CSSProperties } from 'react';
import type { DpadReading } from '@rotp/input-mapping';

interface DpadArm {
  key: keyof DpadReading;
  rect: { x: number; y: number; width: number; height: number };
  notch: string;
}

interface DpadCrossProps {
  pressed: DpadReading;
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
}

export type { DpadArm, DpadCrossProps };

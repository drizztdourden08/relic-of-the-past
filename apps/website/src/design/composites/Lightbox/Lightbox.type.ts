/* @layer website-site @kind types */
import type { ReactNode } from 'react';

type LightboxProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  aspect: number;
  zoomable?: boolean;
  children: ReactNode;
};

type ZoomState = { scale: number; x: number; y: number };

type Point = { x: number; y: number };

export type { LightboxProps, Point, ZoomState };

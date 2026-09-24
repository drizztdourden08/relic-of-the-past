/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/** A section the header links to; `id` matches a `data-section` in the body. */
interface SettingsPageAnchor {
  id: string;
  label: string;
}

interface SettingsPageProps {
  icon: ReactNode;
  title: string;
  /** Fills the header behind the title; the host picks the scene. */
  backdrop?: ReactNode;
  anchors?: SettingsPageAnchor[];
  /** False when the content scrolls its own columns (the Controls tab). */
  scroll?: boolean;
  children: ReactNode;
}

export type { SettingsPageAnchor, SettingsPageProps };

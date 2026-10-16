/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { LanguageSet } from '@rotp/languages';
import type { SaveStatusBadgeProps } from '../SaveStatusBadge.type';

type StudioStatusProps = SaveStatusBadgeProps & {
  origin: LanguageSet['origin'];
  warnings: number;
};

type SetPropertiesProps = {
  set: LanguageSet;
  warnings: number;
};

type StudioNoticesProps = {
  exportStatus: string | null;
};

type EditorBodyProps = {
  id: string | null;
  loading: boolean;
  error: string | null;
  ready: boolean;
  children: ReactNode;
};

export type { EditorBodyProps, SetPropertiesProps, StudioNoticesProps, StudioStatusProps };

/* @layer website-site @kind types */
import type { Screenshot } from './screenshot.type';

type Feature = {
  id: string;
  title: string;
  body: string;
  shot: Screenshot;
  compare?: Screenshot;
};

export type { Feature };

/* @layer renderer-widgets @kind types */
import type { DataCorrection } from '../../views/NavigationWidget/NavigationWidget.type';

interface Finding {
  issues: string[];
  corrections: DataCorrection[];
}

export type { Finding };

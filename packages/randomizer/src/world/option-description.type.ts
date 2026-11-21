/* @layer shared-game @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

interface OptionDetail {
  term: string;
  detail: string;
}

type OptionDescription = string | readonly OptionDetail[];

interface OptionDetailSource {
  term: Text;
  detail: Text;
}

type OptionDescriptionSource = Text | readonly OptionDetailSource[];

export type { OptionDescription, OptionDescriptionSource, OptionDetail, OptionDetailSource };

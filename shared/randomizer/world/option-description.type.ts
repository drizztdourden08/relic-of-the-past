/* @layer shared-game @kind types */
interface OptionDetail {
  term: string;
  detail: string;
}

type OptionDescription = string | readonly OptionDetail[];

export type { OptionDescription, OptionDetail };

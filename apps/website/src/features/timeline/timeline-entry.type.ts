/* @layer website-site @kind types */
type TimelineEntry = {
  id: string;
  label: string;
  marker: string;
  children?: readonly TimelineEntry[];
};

export type { TimelineEntry };

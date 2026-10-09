/* @layer renderer-components @kind types */
type AttrSpec = {
  default: unknown;
  parseHTML: (element: HTMLElement) => unknown;
  renderHTML: (attributes: Record<string, unknown>) => Record<string, string>;
};

export type { AttrSpec };

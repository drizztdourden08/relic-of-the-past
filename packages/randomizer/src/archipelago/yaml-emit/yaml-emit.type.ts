/* @layer shared-game @kind types */
type YamlValue = string | number | boolean | null | undefined | readonly unknown[] | { [key: string]: unknown };

export type { YamlValue };

/* @layer shared-game @kind logic */
const priceField = {
  currency: (prefix: string): string => `${prefix}.currency`,
  amount: (prefix: string): string => `${prefix}.amount`,
  item: (prefix: string): string => `${prefix}.item`,
  count: (prefix: string): string => `${prefix}.count`,
  overLimit: (prefix: string): string => `${prefix}.overLimit`,
  content: (prefix: string): string => `${prefix}.content`,
} as const;

export { priceField };

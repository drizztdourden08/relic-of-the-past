/* @layer shared-store @kind types */
type Stars = 1 | 2 | 3 | 4 | 5;

type Rating = { itemId: string; userId: string; stars: Stars; at: number };

type Install = {
  itemId: string;
  userId: string;
  version: number;
  firstAt: number;
  lastAt: number;
};

export type { Stars, Rating, Install };

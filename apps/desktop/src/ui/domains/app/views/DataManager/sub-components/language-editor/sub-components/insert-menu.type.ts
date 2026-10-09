/* @layer renderer-components @kind types */
import type { Token } from '@shared/game/language';

type InsertChoice = {
  value: string;
  label: string;
  hint?: string;
};

type InsertOption = {
  id: string;
  label: string;
  description: string;
  needsChoice: boolean;
  choices: InsertChoice[];
  make: (choice: string | null) => Token;
};

type InsertGroup = {
  id: string;
  heading: string;
  options: InsertOption[];
};

type SectionId = 'values' | 'pacing' | 'layout';

export type { InsertChoice, InsertGroup, InsertOption, SectionId };

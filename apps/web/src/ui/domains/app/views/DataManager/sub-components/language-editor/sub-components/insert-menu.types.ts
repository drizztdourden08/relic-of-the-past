/* @layer renderer-components @kind types */
/**
 * The insert menu's model: what a translator can add to an entry, grouped into
 * plain-language sections. Every field here is presentation — the menu builder
 * fills them from the control-code catalog and the language's own alphabet, and
 * the component only lays them out.
 */
import type { Token } from '@shared/game/language';

/** One value a row's picker offers: a code parameter, or a glossary key. */
type InsertChoice = {
  value: string;
  label: string;
  /** Secondary text: what the value means, or a term's expansion. */
  hint?: string;
};

/** One insertable thing, as one row of the menu. */
type InsertOption = {
  id: string;
  label: string;
  description: string;
  /** True when a value must be picked before the row can be added. */
  needsChoice: boolean;
  /** The only values offered; empty when nothing is picked, or nothing is available. */
  choices: InsertChoice[];
  /** Builds the token to add. `choice` is null for a row that needs none. */
  make: (choice: string | null) => Token;
};

/** One section of the menu, with the heading a translator reads. */
type InsertGroup = {
  id: string;
  heading: string;
  options: InsertOption[];
};

export type { InsertChoice, InsertGroup, InsertOption };

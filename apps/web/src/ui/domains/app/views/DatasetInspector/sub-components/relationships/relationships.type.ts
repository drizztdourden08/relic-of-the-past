/* @layer renderer-app @kind types */

/** One labeled edge out of a record — a single id, or several (a trigger list, a room list). */
interface RelationshipGroup {
  label: string;
  ids: string[];
}

export type { RelationshipGroup };

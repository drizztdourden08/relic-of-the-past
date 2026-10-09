/* @layer shared-game @kind logic */
const withNote = <T extends object>(base: T, note: string | undefined): T => (
  note === undefined ? base : { ...base, note }
);

export { withNote };

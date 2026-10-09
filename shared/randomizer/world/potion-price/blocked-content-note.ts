/* @layer shared-game @kind logic */
const blockedContentNote = (label: string): string =>
  `${label} is not for sale: its cauldron holds a shuffled item.`;

export { blockedContentNote };

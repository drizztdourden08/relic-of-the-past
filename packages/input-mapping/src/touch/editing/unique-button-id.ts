/* @layer shared-input @kind logic */
const uniqueButtonId = (used: ReadonlySet<string>, stem: string): string => {
  let n = 1;
  while (used.has(`${stem}-${n}`)) n += 1;
  return `${stem}-${n}`;
};

export { uniqueButtonId };

/* @layer shared-asset-extraction @kind logic */
const dialogueFilename = (lang: string): string => {
  if (lang === 'us') return 'dialogue.txt';
  return `dialogue_${lang.replace('-', '_')}.txt`;
};

export { dialogueFilename };

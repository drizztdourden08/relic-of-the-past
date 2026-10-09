/* @layer shared-input @kind logic */
const withFolder = (folder: string, files: Record<string, string>): Record<string, string> => {
  return Object.fromEntries(Object.entries(files).map(([key, file]) => [key, `buttons/${folder}/${file}.svg`]));
};

export { withFolder };

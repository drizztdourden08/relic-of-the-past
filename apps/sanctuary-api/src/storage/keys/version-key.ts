/* @layer root-config @kind logic */
const versionKey = (fileId: string, n: number): string => `files/${fileId}/v${n}`;

export { versionKey };

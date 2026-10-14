/* @layer shared-input @kind logic */
const sdlIndexOf = (table: Readonly<Record<string, number>>, position: string): number | undefined => table[position];

export { sdlIndexOf };

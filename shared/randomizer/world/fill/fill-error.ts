/* @layer shared-game @kind logic */
class FillError extends Error {
  readonly item: string;

  constructor(item: string, detail: string) {
    super(`no fillable location for ${item} (${detail})`);
    this.name = 'FillError';
    this.item = item;
  }
}

export { FillError };

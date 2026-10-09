/* @layer shared-input @kind logic */
class SlotMigrationError extends Error {
  constructor(message: string) {
    super(`[controls] cannot migrate stored slots: ${message}`);
    this.name = 'SlotMigrationError';
  }
}

export { SlotMigrationError };

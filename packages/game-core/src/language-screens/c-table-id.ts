/* @layer bridge-wasm @kind logic */
import { C_TABLE_IDS, SHEET_ID_MIN } from './language-screens.constants';

const cTableIdOf = (id: number): number | null => (id >= SHEET_ID_MIN ? id : C_TABLE_IDS.get(id) ?? null);

export { cTableIdOf };

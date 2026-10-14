/* @layer renderer-components @kind logic */
import { padHex } from './pad-hex';

const padHexOrNull = (value: string | null | undefined): string | null => (value ? padHex(value) : null);

export { padHexOrNull };

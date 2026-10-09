/* @layer bridge-wasm @kind constants */
import type { CapacityLineMessages, RungMessageIdOf } from './capacity-rung-messages.type';

const NO_RUNG_LINES: RungMessageIdOf = () => undefined;
const NO_CAPACITY_LINES: CapacityLineMessages = { rungMessageIdOf: NO_RUNG_LINES, fixedLineMessages: [] };

export { NO_CAPACITY_LINES, NO_RUNG_LINES };

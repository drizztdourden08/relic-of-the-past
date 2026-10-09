/* @layer shared-game @kind constants */
import { POND_INSTANCES } from '../../pond/pond-instances';

const RESTOCK_ORDINALS: readonly string[] = ['2nd', '3rd', '4th', '5th'];

const POND_LABEL_BY_ID: ReadonlyMap<string, string> = new Map(
  POND_INSTANCES.map((pond) => [pond.id, pond.label]),
);

const POND_RUNG = /^slot-pond-(.+)-(\d+)$/;

export { RESTOCK_ORDINALS, POND_LABEL_BY_ID, POND_RUNG };

/* @layer shared-game @kind constants */
import { CODE_CATALOG } from './code-catalog-entries.constants';

const CATALOG_BY_NAME = new Map(CODE_CATALOG.map((info) => [info.name, info]));

const ORG_PARAM_RANGE = Array.from({ length: 256 }, (_, value) => value);

const ORG_PARAM_SLOT_BYTES = 2;

export { CATALOG_BY_NAME, ORG_PARAM_RANGE, ORG_PARAM_SLOT_BYTES };

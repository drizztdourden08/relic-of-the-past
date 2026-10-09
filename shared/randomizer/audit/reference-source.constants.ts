/* @layer shared-game @kind constants */
const MIN_EXPECTED_LOCATIONS = 200;
const TABLE_START_MARKER = 'location_table: typing.Dict';
const TABLE_END_MARKER = 'lookup_id_to_name';

const ENTRY_PATTERN =
  /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*:\s*\(\s*(None|0x[0-9a-fA-F]+|\d+|\[[^\]]*\])\s*,\s*(?:None|0x[0-9a-fA-F]+|\d+)\s*,\s*(True|False)/gs;

export { ENTRY_PATTERN, MIN_EXPECTED_LOCATIONS, TABLE_END_MARKER, TABLE_START_MARKER };

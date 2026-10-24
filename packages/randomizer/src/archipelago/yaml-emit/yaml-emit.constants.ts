/* @layer shared-game @kind constants */
const INDENT = '  ';

/** Words YAML 1.1 and 1.2 readers turn into booleans or null, and Archipelago's roll keyword. */
const RESERVED = /^(?:true|false|yes|no|on|off|y|n|null|~|random)$/i;

const NUMERIC = /^[-+]?(?:\d[\d_]*(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$|^0x[\da-f]+$|^0o[0-7]+$|^[-+]?\.(?:inf|nan)$/i;

const PLAIN = /^[A-Za-z_./][\w ./()-]*$/;

export { INDENT, NUMERIC, PLAIN, RESERVED };

/* @layer shared-game @kind constants */
const modules = import.meta.glob('../records/native-tables/*.ts', { eager: true });

const NATIVE_TABLE_EXPORTS: Readonly<Record<string, unknown>> = Object.assign({}, ...Object.values(modules));

export { NATIVE_TABLE_EXPORTS };

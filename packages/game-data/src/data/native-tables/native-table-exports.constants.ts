/* @layer shared-game @kind constants */
const modules = import.meta.glob<Record<string, unknown>>('../records/native-tables/*.ts', { eager: true });

const NATIVE_TABLE_EXPORTS: Readonly<Record<string, unknown>> = Object.fromEntries(
  Object.values(modules).flatMap((module) => Object.entries(module)),
);

export { NATIVE_TABLE_EXPORTS };

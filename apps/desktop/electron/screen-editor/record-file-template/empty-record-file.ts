/* @layer electron-main @kind logic */
import { recordArrayName } from '@shared/game/data/record-file-targets';
import { RECORD_TYPES_MODULE } from './empty-record-file.constants';

const emptyRecordFile = (relativePath: string, recordType: string): string | null => {
  const name = recordArrayName(relativePath);
  if (!name) return null;
  return '/* @layer shared-game @kind data */\n'
    + `import type { ${recordType} } from ${RECORD_TYPES_MODULE};\n\n`
    + `const ${name}: ${recordType}[] = [\n];\n\nexport { ${name} };\n`;
};

export { emptyRecordFile };

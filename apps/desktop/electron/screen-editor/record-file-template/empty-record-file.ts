/* @layer electron-main @kind logic */
import { recordArrayName } from '@rotp/game-data';
import { RECORD_TYPES_FOLDER } from './empty-record-file.constants';

const emptyRecordFile = (relativePath: string, recordType: string): string | null => {
  const name = recordArrayName(relativePath);
  if (!name) return null;
  const typesModule = `'${'../'.repeat(relativePath.split('/').length)}${RECORD_TYPES_FOLDER}'`;
  return '/* @layer shared-game @kind data */\n'
    + `import type { ${recordType} } from ${typesModule};\n\n`
    + `const ${name}: ${recordType}[] = [\n];\n\nexport { ${name} };\n`;
};

export { emptyRecordFile };

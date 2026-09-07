/* @layer electron-main @kind logic */
/** Assembles one debug-report .zip from the collected files plus what the renderer sent. */
import JSZip from 'jszip';
import type { DebugReportPackageInput } from '@shared/types/debug-report';
import type { DebugReportCollectedFiles } from './collect-files';

const buildDebugReportZip = async (
  input: DebugReportPackageInput,
  files: DebugReportCollectedFiles,
): Promise<Buffer> => {
  const zip = new JSZip();
  const manifest = {
    createdAt: Date.now(),
    profileId: input.profileId,
    source: input.source,
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('nav-captures.jsonl', input.navCaptures.map((c) => JSON.stringify(c)).join('\n'));
  zip.file('settings.json', JSON.stringify(files.settingsJson, null, 2));
  zip.file('randomizer.json', JSON.stringify(files.randomizerJson, null, 2));
  zip.file(`save/${input.source.kind}-${input.source.ref}.sav`, Buffer.from(input.saveBuffer));
  if (input.screenshotBase64) {
    zip.file('save/screenshot.png', input.screenshotBase64, { base64: true });
  }
  for (const log of files.logFiles) zip.file(`logs/${log.name}`, log.contents);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
};

export { buildDebugReportZip };

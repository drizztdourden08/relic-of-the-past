/* @layer electron-main @kind logic */
/** Assembles one debug-report .zip from the collected files, what the renderer sent, and
 *  every already-finalized capture session sitting on disk. */
import JSZip from 'jszip';
import type { DebugReportPackageInput } from '@shared/types/debug-report';
import type { DebugReportCollectedFiles } from './collect-files';
import type { FinalizedCaptureSession } from './collect-capture-sessions';

const buildDebugReportZip = async (
  input: DebugReportPackageInput,
  files: DebugReportCollectedFiles,
  captureSessions: FinalizedCaptureSession[],
): Promise<Buffer> => {
  const zip = new JSZip();

  const manifest = {
    createdAt: Date.now(),
    profileId: input.profileId,
    saves: input.saves.map(({ kind, ref, savedAt }) => ({ kind, ref, savedAt })),
    captureSessions: captureSessions.map((s) => s.sessionKey),
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('settings.json', JSON.stringify(files.settingsJson, null, 2));
  zip.file('profile.json', JSON.stringify(files.profileJson, null, 2));
  zip.file('randomizer.json', JSON.stringify(files.randomizerJson, null, 2));
  zip.file('input-profiles.json', JSON.stringify(files.inputProfilesJson, null, 2));

  for (const save of input.saves) {
    zip.file(`save/${save.kind}-${save.ref}.sav`, Buffer.from(save.buffer));
  }

  for (const session of captureSessions) {
    for (const file of session.files) {
      zip.file(`capture/${session.sessionKey}/${file.name}`, file.contents);
    }
  }

  for (const log of files.logFiles) zip.file(`logs/${log.name}`, log.contents);

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
};

export { buildDebugReportZip };

/* @layer shared-storage @kind logic */
import { resumePath } from './resume-path';
import type { WriteMsuResumeParams } from './write-msu-resume.type';

const writeMsuResume = (params: WriteMsuResumeParams): Promise<void> => {
  const { files, profile, kind, id, state } = params;
  return files.writeText(resumePath(profile, kind, id), `${JSON.stringify(state, null, 2)}\n`);
};

export { writeMsuResume };

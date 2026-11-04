/* @layer tests @kind helper */
import { writeJson } from '@drizztdourden08/brock-core';
import { createMemFileStore } from '@rotp/game-core';
import type { CreateProfileOptions, Profile } from '@app/profiles/types';

const traceFiles = createMemFileStore();

const state = { created: 0 };

const configPath = (id: string): string => `profiles/${id}/config.json`;

const fakeCreateProfile = async (opts: CreateProfileOptions): Promise<Profile> => {
  state.created++;
  const id = `trace-profile-${state.created}`;
  const profile: Profile = { id, name: opts.name, romFile: opts.romFile, created: 0, lastPlayed: 0 };
  await writeJson(traceFiles, configPath(id), {});
  return profile;
};

const fakeUpdateConfig = async (id: string, change: (current: Record<string, unknown>) => Record<string, unknown>): Promise<void> => {
  const text = await traceFiles.readText(configPath(id));
  await writeJson(traceFiles, configPath(id), change(text === null ? {} : JSON.parse(text) as Record<string, unknown>));
};

export { configPath, fakeCreateProfile, fakeUpdateConfig, traceFiles };

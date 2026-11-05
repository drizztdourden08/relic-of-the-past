/* @layer tests @kind helper */
import { composeProfileHooks, createProfileStore } from '@drizztdourden08/brock-core';
import randomizerRenderer from '@drizztdourden08/brock-randomizer/renderer';
import { createMemFileStore } from '@rotp/game-core';
import { rotpProfileHooks } from '@app/profiles/rotp-profile-hooks';
import type { CreateProfileOptions, Profile } from '@app/profiles/types';

const traceFiles = createMemFileStore();

const configPath = (id: string): string => `profiles/${id}/config.json`;

const moduleProfileStore = createProfileStore(traceFiles, composeProfileHooks([randomizerRenderer.profileHooks, rotpProfileHooks]));

const createThroughModule = (opts: CreateProfileOptions): Promise<Profile> => moduleProfileStore.create(opts);

export { configPath, createThroughModule, traceFiles };

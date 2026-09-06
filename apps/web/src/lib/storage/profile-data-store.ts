/* @layer renderer-lib @kind logic */
/**
 * Renderer per-profile data store (sessions / tracker / input profiles), bound to
 * the platform FileStore. Mirrors the window.api method names for 1:1 call-site swap.
 */
import type { PlaySession } from '@shared/types/session';
import * as store from '@shared/storage/profile-data';
import { getPlatform } from '@app/platform/get-platform';

const files = () => getPlatform().files;

const listSessions = (p: string): Promise<PlaySession[]> => store.listSessions(files(), p);
const saveSession = (p: string, session: PlaySession): Promise<void> => store.saveSession(files(), p, session);
const saveTrackerState = (p: string, state: unknown): Promise<void> => store.saveTracker(files(), p, state);
const loadTrackerState = (p: string): Promise<unknown> => store.loadTracker(files(), p);
const saveRandomizerState = (p: string, placement: unknown): Promise<void> => store.saveRandomizer(files(), p, placement);
const loadRandomizerState = (p: string): Promise<unknown> => store.loadRandomizer(files(), p);
const readInputProfiles = (p: string): Promise<unknown[]> => store.readInputProfiles(files(), p);
const writeInputProfiles = (p: string, profiles: unknown[]): Promise<void> => store.writeInputProfiles(files(), p, profiles);

export { listSessions, saveSession, saveTrackerState, loadTrackerState, saveRandomizerState, loadRandomizerState, readInputProfiles, writeInputProfiles };

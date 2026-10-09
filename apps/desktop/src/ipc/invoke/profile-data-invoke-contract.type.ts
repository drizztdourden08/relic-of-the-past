/* @layer shared-types @kind types */
import type { Profile, AppState, CreateProfileOptions } from '@app/profiles/types';
import type { PlaySession } from '@rotp/game-core';
import type { InvokeResult } from './invoke-result.type';

interface ProfileDataInvokeContract {
  'profiles:list': () => Promise<Profile[]>;
  'profiles:create': (opts: CreateProfileOptions) => Promise<Profile>;
  'profiles:delete': (id: string) => Promise<void>;
  'profiles:setLast': (id: string) => Promise<void>;
  'profiles:getAppState': () => Promise<AppState>;
  'profiles:updateLastPlayed': (id: string) => Promise<void>;
  'profiles:update': (id: string, patch: Partial<Profile>) => Promise<Profile | null>;

  'config:read': (profileId: string) => Promise<Record<string, unknown> | null>;
  'config:write': (profileId: string, settings: Record<string, unknown>) => Promise<void>;

  'sessions:list': (profileId: string) => Promise<PlaySession[]>;
  'sessions:save': (profileId: string, session: PlaySession) => Promise<void>;
  'tracker:save': (profileId: string, state: unknown) => Promise<void>;
  'tracker:load': (profileId: string) => Promise<unknown>;

  'inputProfiles:read': (profileId: string) => Promise<unknown[]>;
  'inputProfiles:write': (profileId: string, profiles: unknown[]) => Promise<void>;

  'sprites:extract': (romFile: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  'sprites:check': (romFile: string) => Promise<{ extracted: boolean; count: number }>;
  'sprites:delete': (romFile: string) => Promise<InvokeResult>;
  'sprites:getPath': (romFile: string, file: string) => Promise<string>;
}

export type { ProfileDataInvokeContract };

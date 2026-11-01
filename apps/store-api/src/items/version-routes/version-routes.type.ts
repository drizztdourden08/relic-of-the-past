/* @layer store-api @kind types */
import type { Actor, StoreItem, StoreVersion } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
import type { Player } from '../../auth/player/player.type';

type VersionRouteContext = Parameters<Route['handler']>[0];

type VersionTarget = { player: Player; item: StoreItem; actors: Actor[]; n: number };

type UploadingVersion = { player: Player; item: StoreItem; version: StoreVersion; upload: NonNullable<StoreVersion['upload']> };

export type { VersionRouteContext, VersionTarget, UploadingVersion };

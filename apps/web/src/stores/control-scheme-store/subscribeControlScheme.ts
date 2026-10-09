/* @layer renderer-stores @kind logic */
import { onSchemeBindings } from '@app/lib/input/scheme-runtime';
import { useGameUIStore } from '../game-ui-store';
import { useSpriteAvailabilityStore } from '../sprite-availability-store';
import { refreshControlSettings } from './refreshControlSettings';
import { reapplyControlSettings } from './reapplyControlSettings';
import { syncControlBindings } from './syncControlBindings';

useGameUIStore.subscribe(refreshControlSettings);

useSpriteAvailabilityStore.subscribe(reapplyControlSettings);

onSchemeBindings(syncControlBindings);

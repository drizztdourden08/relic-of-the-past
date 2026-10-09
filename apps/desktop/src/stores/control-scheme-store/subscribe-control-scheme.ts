/* @layer renderer-stores @kind logic */
import { onSchemeBindings } from '@rotp/input-mapping';
import { useGameUIStore } from '../game-ui-store';
import { useSpriteAvailabilityStore } from '../sprite-availability-store';
import { refreshControlSettings } from './refresh-control-settings';
import { reapplyControlSettings } from './reapply-control-settings';
import { syncControlBindings } from './sync-control-bindings';

useGameUIStore.subscribe(refreshControlSettings);

useSpriteAvailabilityStore.subscribe(reapplyControlSettings);

onSchemeBindings(syncControlBindings);

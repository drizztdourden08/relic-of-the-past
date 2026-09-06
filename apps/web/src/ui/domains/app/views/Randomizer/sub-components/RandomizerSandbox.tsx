/* @layer renderer-components @kind component */
/**
 * Dev-only sandbox: the old generate/start workflow, kept behind a collapsed
 * section for testing. Sessions started here carry the 'manual' source and run
 * through the same shared session store as profile-tied ones. The seed and the
 * generated placement live at module level so closing and reopening the page
 * keeps them.
 */
import { useState } from 'react';
import { Box, Button, Text, TextInput } from '@ds/primitives';
import { generateFromSnapshot } from '@shared/randomizer/generate';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import {
  probeDeliverableCapacityLocations, probeDeliverableNpcLocations,
  startLocalFromPlacement, stopActive,
} from '../../../../../../lib/game/randomizer-client';
import type { ActiveSession } from '../../../../../../lib/game/randomizer-client';
import { log } from '../../../../../../lib/log-bus';

interface RandomizerSandboxProps {
  session: ActiveSession | null;
  status: ActiveSession['status'];
  gameRunning: boolean;
}

let sandboxSeed = '';
let sandboxPlacement: ApPlacement | null = null;

const randomSeed = (): string => Math.random().toString(36).slice(2, 10);

const RandomizerSandbox = (props: RandomizerSandboxProps) => {
  const { session, status, gameRunning } = props;
  const [open, setOpen] = useState(false);
  const [seed, setSeedState] = useState(sandboxSeed);
  const [placement, setPlacementState] = useState<ApPlacement | null>(sandboxPlacement);

  const sessionActive = session != null && (status === 'active' || status === 'starting');

  const generate = () => {
    const effectiveSeed = seed.trim() || randomSeed();
    try {
      // Baseline options: the same defaults profile creation freezes, with the
      // same physical-capability sets steering the npc scope and capacity slots.
      const result = generateFromSnapshot(effectiveSeed, buildOptionsSnapshot(),
        probeDeliverableNpcLocations(), probeDeliverableCapacityLocations());
      sandboxPlacement = result;
      sandboxSeed = effectiveSeed;
      setPlacementState(result);
      setSeedState(effectiveSeed);
      log.randomizer(`Placement generated: seed ${effectiveSeed}, ${Object.keys(result.nameView).length} locations, ${result.spheres.length} spheres`);
    } catch (error) {
      log.randomizer(`Generation failed for seed ${effectiveSeed}: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  return (
    <Box className="randomizer-page__panel randomizer-page__sandbox">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide sandbox' : 'Sandbox (dev)'}
      </Button>
      {open && (
        <>
          <Box className="randomizer-page__seed-row">
            <TextInput
              value={seed}
              onChange={(e) => { sandboxSeed = e.target.value; setSeedState(e.target.value); }}
              placeholder="blank = random"
              disabled={sessionActive}
              aria-label="Sandbox seed"
            />
            <Button variant="secondary" onClick={generate} disabled={sessionActive}>Generate</Button>
          </Box>
          {placement && (
            <Text className="randomizer-page__summary">
              {Object.keys(placement.nameView).length} locations · {placement.spheres.length} spheres · seed {placement.seed}
            </Text>
          )}
          <Box className="randomizer-page__actions">
            {sessionActive ? (
              <Button variant="secondary" onClick={stopActive}>Stop session</Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => { if (placement) void startLocalFromPlacement(placement, 'manual'); }}
                disabled={!placement || !gameRunning}
              >
                Start session
              </Button>
            )}
          </Box>
          {!gameRunning && !sessionActive && (
            <Text className="randomizer-page__hint">Start is blocked: the game is not running.</Text>
          )}
        </>
      )}
    </Box>
  );
};

export { RandomizerSandbox };
export type { RandomizerSandboxProps };

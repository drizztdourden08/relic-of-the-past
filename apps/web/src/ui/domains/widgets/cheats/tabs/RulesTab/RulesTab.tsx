/* @layer renderer-widgets @kind component */
/**
 * The Rules tab: state and combat cheats as tiles, drawn from three tables. The tab
 * reads each tile's value from its getter on render and bumps a tick after every write,
 * because the getters are plain module state and never re-render on their own. Tiles
 * belong to different gate categories, so there is no whole-tab overlay: each tile
 * draws inert by itself when its category is off.
 */
import { useReducer } from 'react';
import { Box, Text } from '@ds/primitives';
import type { CheatCategory } from '@app/lib/game';
import type { CheatGates } from '../../behavior/useCheatGates';
import { ACTION_TILES, RULES_HINT, RULE_TILES, RUNG_TILES } from './RulesTab.constants';
import { RuleTile } from './sub-components/RuleTile';
import { RungTile } from './sub-components/RungTile';
import { ActionTile } from './sub-components/ActionTile';
import './RulesTab.css';

type RulesTabProps = {
  gates: CheatGates;
};

const bump = (tick: number): number => tick + 1;

const RulesTab = (props: RulesTabProps) => {
  const { gates } = props;
  const [, rerender] = useReducer(bump, 0);
  const reasonFor = (category: CheatCategory): string | undefined =>
    (gates.allowed[category] ? undefined : gates.reason(category));

  return (
    <Box className="cheats-rules">
      <Text as="h3" className="cheats-section__title">States</Text>
      <Box className="cheats-rules__grid">
        {RULE_TILES.map((spec) => (
          <RuleTile
            key={spec.id}
            spec={spec}
            checked={spec.read()}
            reason={reasonFor(spec.category)}
            onChange={(on) => { spec.write(on); rerender(); }}
          />
        ))}
      </Box>

      <Text as="h3" className="cheats-section__title">Combat</Text>
      <Box className="cheats-rules__ladders">
        {RUNG_TILES.map((spec) => (
          <RungTile
            key={spec.id}
            spec={spec}
            value={spec.read()}
            reason={reasonFor(spec.category)}
            onChange={(value) => { spec.write(value); rerender(); }}
          />
        ))}
      </Box>

      <Text as="h3" className="cheats-section__title">Actions</Text>
      <Box className="cheats-rules__grid">
        {ACTION_TILES.map((spec) => (
          <ActionTile key={spec.id} spec={spec} reason={reasonFor(spec.category)} />
        ))}
      </Box>

      <Text as="p" className="cheats-hint">{RULES_HINT}</Text>
    </Box>
  );
};

export { RulesTab };
export type { RulesTabProps };

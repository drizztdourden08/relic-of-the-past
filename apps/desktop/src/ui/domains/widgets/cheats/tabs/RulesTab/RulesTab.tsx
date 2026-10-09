/* @layer renderer-widgets @kind component */
import { useEffect, useReducer } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { CheatCategory } from '@app/lib/game';
import { onCheatRulesRestored } from '@app/lib/game/cheat-rules-memory';
import type { CheatTabProps } from '../../CheatsWidget.type';
import { ACTION_TILES, RULES_HINT, RULE_TILES, RUNG_TILES } from './RulesTab.constants';
import { RuleTile } from './sub-components/RuleTile';
import { RungTile } from './sub-components/RungTile';
import { ActionTile } from './sub-components/ActionTile';
import './RulesTab.css';

const bump = (tick: number): number => tick + 1;

const RulesTab = (props: CheatTabProps) => {
  const { gates } = props;
  const [, rerender] = useReducer(bump, 0);
  useEffect(() => onCheatRulesRestored(rerender), []);
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

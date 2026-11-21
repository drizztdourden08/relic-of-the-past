/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { hexLabelOf } from '../behavior/hex-label-of';
import { DescRow } from './DescRow';
import type { OutdoorRowsProps } from './GameStatePanel.type';

const OutdoorRows = ({ overworldScreenIndex, isDarkWorld }: OutdoorRowsProps) => {
  const t = useT();
  return (
    <>
      <DescRow id="Screen" label={t('views-navigation:desc.screen.label')} desc={t('views-navigation:desc.screen.text')}>
        <Text>{hexLabelOf(overworldScreenIndex, 2)} (R{(overworldScreenIndex >> 3) & 7} C{overworldScreenIndex & 7})</Text>
      </DescRow>
      <DescRow id="World" label={t('views-navigation:desc.world.label')} desc={t('views-navigation:desc.world.text')}>
        <Text className={isDarkWorld ? 'nav-game-state-panel__dark-world' : 'nav-val-green'}>{isDarkWorld ? t('views-navigation:world.dark') : t('views-navigation:world.light')}</Text>
      </DescRow>
    </>
  );
};

export { OutdoorRows };

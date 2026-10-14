/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { ButtonMappingItem } from './ButtonMappingItem';
import type { ButtonMappingListProps } from './ButtonMapping.type';

const ButtonMappingList = (props: ButtonMappingListProps) => {
  const { items, activeIndex, inputPhaseActive, includeStickTriggerIds, onClickItem, onClearItem } = props;

  return (
    <Box className="hid-cal__input-grid">
      {items.map((item, i) => {
        if (!includeStickTriggerIds && (STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id))) return null;
        return (
          <ButtonMappingItem
            key={item.id}
            item={item}
            index={i}
            isActive={i === activeIndex && inputPhaseActive}
            onClickItem={onClickItem}
            onClearItem={onClearItem}
          />
        );
      })}
    </Box>
  );
};

export { ButtonMappingList };

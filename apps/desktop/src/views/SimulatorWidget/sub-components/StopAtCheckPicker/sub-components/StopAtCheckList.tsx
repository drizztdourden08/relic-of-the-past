/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import { checkName } from '@app/game/record-text';
import { checkTypeIcon } from '../behavior/check-type-icon';
import { LIST_SHAPE, NO_STOP_ICON } from '../StopAtCheckPicker.constants';
import type { CheckStatus } from '@rotp/game-data';
import type { StopAtCheckListProps } from '../StopAtCheckPicker.type';

const StopAtCheckList = (props: StopAtCheckListProps) => {
  const { checks, selectedId, statuses, onSelect } = props;
  const t = useT();
  const statusOf = (id: string): CheckStatus => statuses.get(id) ?? 'blocked';

  return (
    <>
      <ListItemList className="stop-picker__list" label={t('views-simulator:controls.stop.at')} shape={LIST_SHAPE}>
        <ListItemRow
          icon={<Icon className="stop-picker__row-icon" name={NO_STOP_ICON} />}
          name={t('views-simulator:picker.none')}
          selected={selectedId === ''}
          onClick={() => onSelect('')}
        />
        {checks.map((check) => (
          <ListItemRow
            key={check.id}
            className={`stop-picker__row--${statusOf(check.id)}`}
            icon={<Icon className="stop-picker__row-icon" name={checkTypeIcon(check.kind)} label={check.kind} />}
            name={<Text className={`stop-picker__row-name stop-picker__row-name--${statusOf(check.id)}`}>{checkName(check)}</Text>}
            columns={[{ primary: <Text className="stop-picker__row-id">{check.id}</Text>, align: 'end' }]}
            selected={selectedId === check.id}
            onClick={() => onSelect(check.id)}
          />
        ))}
      </ListItemList>
      {checks.length === 0 && (
        <Text className="stop-picker__empty">{t('views-simulator:picker.empty')}</Text>
      )}
    </>
  );
};

export { StopAtCheckList };

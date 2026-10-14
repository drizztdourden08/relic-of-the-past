/* @layer renderer-widgets @kind component */
import { Icon, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import { checkTypeIcon } from '../behavior/check-type-icon';
import { LIST_SHAPE, NO_STOP_ICON } from '../StopAtCheckPicker.constants';
import type { CheckStatus } from '@rotp/game-data';
import type { StopAtCheckListProps } from '../StopAtCheckPicker.type';

const StopAtCheckList = (props: StopAtCheckListProps) => {
  const { checks, selectedId, statuses, onSelect } = props;
  const statusOf = (id: string): CheckStatus => statuses.get(id) ?? 'blocked';

  return (
    <>
      <ListItemList className="stop-picker__list" label="Stop at check" shape={LIST_SHAPE}>
        <ListItemRow
          icon={<Icon className="stop-picker__row-icon" name={NO_STOP_ICON} />}
          name="No stop (full run)"
          selected={selectedId === ''}
          onClick={() => onSelect('')}
        />
        {checks.map((check) => (
          <ListItemRow
            key={check.id}
            className={`stop-picker__row--${statusOf(check.id)}`}
            icon={<Icon className="stop-picker__row-icon" name={checkTypeIcon(check.kind)} label={check.kind} />}
            name={<Text className={`stop-picker__row-name stop-picker__row-name--${statusOf(check.id)}`}>{check.name}</Text>}
            columns={[{ primary: <Text className="stop-picker__row-id">{check.id}</Text>, align: 'end' }]}
            selected={selectedId === check.id}
            onClick={() => onSelect(check.id)}
          />
        ))}
      </ListItemList>
      {checks.length === 0 && (
        <Text className="stop-picker__empty">No checks match these filters.</Text>
      )}
    </>
  );
};

export { StopAtCheckList };

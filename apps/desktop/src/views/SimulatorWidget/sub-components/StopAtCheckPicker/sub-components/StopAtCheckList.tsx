/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import { checkTypeIcon } from '../behavior/check-type-icon';
import { LIST_SHAPE } from '../StopAtCheckPicker.constants';
import type { StopAtCheckListProps } from '../StopAtCheckPicker.type';

const StopAtCheckList = (props: StopAtCheckListProps) => {
  const { checks, selectedId, statuses, onSelect } = props;

  return (
    <>
      <ListItemList className="stop-picker__list" label="Stop at check" shape={LIST_SHAPE}>
        <ListItemRow
          icon={<Text className="stop-picker__row-icon">∞</Text>}
          name="No stop (full run)"
          selected={selectedId === ''}
          onClick={() => onSelect('')}
        />
        {checks.map((check) => (
          <ListItemRow
            key={check.id}
            className={`stop-picker__row--${statuses.get(check.id) ?? 'blocked'}`}
            icon={<Text className="stop-picker__row-icon" title={check.kind}>{checkTypeIcon(check.kind)}</Text>}
            name={check.name}
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

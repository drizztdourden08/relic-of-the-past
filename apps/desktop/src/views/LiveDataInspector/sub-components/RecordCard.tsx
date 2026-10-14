/* @layer renderer-widgets @kind component */
import { Box, Flex, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { CompactRecordView } from '@drizztdourden08/tessera/composites';
import { useDataViewStore } from '@app/stores/data-view-store';
import type { ReviewMark } from '@rotp/game-data';
import { EDIT_LABEL } from '../LiveDataInspector.constants';
import type { RecordCardProps } from '../LiveDataInspector.type';
import { ReviewControls } from './ReviewControls';
import './RecordCard.css';

const RecordCard = <T,>(props: RecordCardProps<T>) => {
  const { kind, id, record, schema, config, resolveIdRefDisplay, diffs, fieldRenderers } = props;
  const openRecord = useDataViewStore((state) => state.openRecord);

  return (
    <Box className="live-record-card">
      <Flex justify="end" className="live-record-card__actions">
        <IconButton label={EDIT_LABEL} title={EDIT_LABEL} onClick={() => openRecord(kind, id)}>
          <Icon name="pencil" />
        </IconButton>
      </Flex>
      <CompactRecordView
        record={record}
        schema={schema}
        config={config}
        resolveIdRefDisplay={resolveIdRefDisplay}
        diffs={diffs}
        fieldRenderers={fieldRenderers}
      />
      <ReviewControls kind={kind} recordId={id} record={record as { review?: ReviewMark }} />
    </Box>
  );
};

export { RecordCard };

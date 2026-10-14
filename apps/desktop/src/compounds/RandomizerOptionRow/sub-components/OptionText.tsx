/* @layer renderer-components @kind component */
import { Box, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { OptionDescription } from '../../OptionDescription';
import { tagFor } from '../behavior/tag-for';
import type { OptionTextProps } from '../RandomizerOptionRow.type';

const OptionText = ({ option, note, forced }: OptionTextProps) => {
  const tag = tagFor(option);

  return (
    <Box className="rand-opt-row__text">
      <Box className="rand-opt-row__title">
        <Text className="rand-opt-row__label">{option.displayName}</Text>
        {tag != null && <Tag className="rand-opt-row__tag">{tag}</Tag>}
      </Box>
      <OptionDescription
        className="rand-opt-row__description"
        description={option.details ?? option.description}
      />
      {forced && <Text className="rand-opt-row__note">{note}</Text>}
    </Box>
  );
};

export { OptionText };

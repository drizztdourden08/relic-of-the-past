/* @layer renderer-components @kind component */
// Kept sorted and de-duplicated: two identical offsets would schedule the same sound twice.
import { useState } from 'react';
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Text } from '@ds/primitives/Text';
import type { IntervalTimesProps } from './IntervalTimes.type';

const IntervalTimes = (props: IntervalTimesProps) => {
  const { atSeconds, disabled = false, onChange } = props;
  const [draft, setDraft] = useState(0);

  const add = () => {
    if (!Number.isFinite(draft) || draft < 0 || atSeconds.includes(draft)) return;
    onChange([...atSeconds, draft].sort((a, b) => a - b));
    setDraft(0);
  };

  return (
    <Box className="layer-card__intervals">
      <Flex gap="xs" align="center" wrap>
        {atSeconds.length === 0 && <Text variant="caption">No times yet. Add one below.</Text>}
        {atSeconds.map((seconds) => (
          <Flex key={seconds} gap="xs" align="center" className="layer-card__interval">
            <Badge variant="neutral">{seconds}s</Badge>
            <IconButton
              variant="ghost"
              size="sm"
              label={`Remove ${seconds} seconds`}
              disabled={disabled}
              onClick={() => onChange(atSeconds.filter((s) => s !== seconds))}
            >
              ✕
            </IconButton>
          </Flex>
        ))}
      </Flex>
      <Flex gap="sm" align="end">
        <Field label="Add time (s)">
          <NumberInput
            min={0} step={0.25} max={3600} sizeToContent value={draft} disabled={disabled}
            onChange={(value) => setDraft(Number.isFinite(value) ? value : 0)}
          />
        </Field>
        <Button variant="secondary" size="sm" disabled={disabled} onClick={add}>Add</Button>
      </Flex>
    </Box>
  );
};

export { IntervalTimes };

/* @layer renderer-components @kind component */
/**
 * The ladder a capacity family produces, as chips: the start value, then a
 * jump label and a cumulative chip per pool item. Dim in Vanilla (the native
 * ladder, nothing in the pool); the last chip is flagged when its jump ran
 * past the top of the ladder; an ordered ladder numbers its jumps (1st,
 * 2nd ...) because pickups take them in that order. Values arrive formatted
 * and the compound only lays them out.
 */
import { Box, Text } from '@ds/primitives';
import type { LadderPreviewProps } from './LadderPreview.type';
import './LadderPreview.css';

const ordinalOf = (n: number): string => {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
};

const LadderPreview = (props: LadderPreviewProps) => {
  const { chips, jumps, dim = false, note, surplus = false, ordered = false, className = '' } = props;
  const lastIndex = chips.length - 1;

  return (
    <Box className={`ladder-preview${dim ? ' ladder-preview--dim' : ''}${className ? ` ${className}` : ''}`}>
      {chips.map((chip, index) => {
        const flagged = surplus && index === lastIndex;
        return (
          <Box key={index} className="ladder-preview__step">
            {index > 0 && (
              <Text className="ladder-preview__jump">
                {ordered && <Text className="ladder-preview__ordinal">{ordinalOf(index)}</Text>}
                {jumps[index - 1]}
              </Text>
            )}
            <Text className={`ladder-preview__chip${flagged ? ' ladder-preview__chip--surplus' : ''}`}>
              {chip}
            </Text>
          </Box>
        );
      })}
      {note !== undefined && <Text className="ladder-preview__note">{note}</Text>}
    </Box>
  );
};

export { LadderPreview };

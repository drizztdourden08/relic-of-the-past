/* @layer renderer-components @kind component */
import { Box, Image, Text } from '@ds/primitives';
import type { LadderPreviewProps } from './LadderPreview.type';
import './LadderPreview.css';

const ordinalOf = (n: number): string => {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
};

const LadderPreview = (props: LadderPreviewProps) => {
  const {
    chips, jumps, icons, dim = false, note, surplus = false, ordered = false, className = '',
  } = props;
  const lastIndex = chips.length - 1;

  return (
    <Box className={`ladder-preview${dim ? ' ladder-preview--dim' : ''}${className ? ` ${className}` : ''}`}>
      {chips.map((chip, index) => {
        const flagged = surplus && index === lastIndex;
        const icon = icons?.[index];
        return (
          <Box key={index} className="ladder-preview__step">
            {index > 0 && (
              <Text className="ladder-preview__jump">
                {ordered && <Text className="ladder-preview__ordinal">{ordinalOf(index)}</Text>}
                {jumps[index - 1]}
              </Text>
            )}
            <Text className={`ladder-preview__chip${flagged ? ' ladder-preview__chip--surplus' : ''}`}>
              {icon !== undefined && (
                <Image className="ladder-preview__icon" src={icon} alt="" draggable={false} />
              )}
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

/* @layer renderer-components @kind component */
import { Box, Button } from '../../../../../design-system/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { S } from '../SpriteDebug.constants';

const StatusBtns = ({ current, onClick }: { current: ReviewStatus; onClick: (s: ReviewStatus) => void }) => {
  return (
    <Box style={S.statusBtns}>
      {([['✓', 'good', 'var(--c-green-bright)'], ['●', 'yellow', 'var(--c-warning)'], ['-', 'neutral', 'var(--c-text-muted)'], ['✗', 'bad', 'var(--c-danger)']] as const).map(([icon, st, color]) => {
        const active = current === st;
        return (
          <Button variant="bare" key={st} onClick={() => onClick(st)} style={{
            ...S.statusBtn,
            color: active ? 'var(--c-text)' : color,
            background: active ? color : 'transparent',
            borderColor: active ? color : 'var(--c-border-strong)',
          }}>
            {icon}
          </Button>
        );
      })}
    </Box>
  );
};

export { StatusBtns };

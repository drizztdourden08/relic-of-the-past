/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { grantFromCheck } from '@app/game';
import { detailOf } from '../behavior/detail-of';
import { screenLabelOf } from '../behavior/screen-label-of';
import type { CheckEntryProps } from '../ChecksTab.type';

const CheckEntry = ({ check, done, plan }: CheckEntryProps) => {
  const t = useT();
  const blocked = plan.kind === 'blocked';
  const detail = detailOf(t, plan);

  return (
    <Box className={`cheats-checks__entry ${done ? 'cheats-checks__entry--completed' : ''}`}>
      <Box className="cheats-checks__text">
        <Text className="cheats-checks__name" title={`${screenLabelOf(check)} - ${check.kind}`}>
          {check.name}
        </Text>
        <Text className={`cheats-checks__gives ${blocked ? 'cheats-checks__gives--blocked' : ''}`}>
          {detail}
        </Text>
      </Box>
      <Button
        size="sm"
        className="cheats-checks__grant-btn"
        disabled={done || blocked}
        title={detail}
        onClick={() => grantFromCheck(check)}
      >
        {t('views-cheats:checks.grant')}
      </Button>
    </Box>
  );
};

export { CheckEntry };

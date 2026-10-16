/* @layer renderer-components @kind component */
import { Fragment } from 'react';
import { Box, Divider, HintLine, Text } from '@drizztdourden08/tessera/primitives';
import type { StudioTopBarProps } from '../StudioFrame.type';
import { StudioActionButton } from './StudioActionButton';

const StudioTopBar = (props: StudioTopBarProps) => {
  const { caption, title, status, groups, idleHint, notices } = props;

  return (
    <Box as="header" surface="raised" className="studio-frame__bar">
      <Box className="studio-frame__bar-head">
        <Box className="studio-frame__bar-title">
          <Text variant="overline" tone="muted">{caption}</Text>
          <Text as="h1" variant="title">{title}</Text>
        </Box>
        {status && <Box className="studio-frame__bar-status">{status}</Box>}
      </Box>

      <Box className="studio-frame__bar-groups">
        {groups.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && <Divider orientation="vertical" />}
            <Box role="group" aria-label={group.label} className="studio-frame__group">
              <Text variant="overline" tone="muted">{group.label}</Text>
              <Box className="studio-frame__group-row">
                {group.actions.map((action) => <StudioActionButton key={action.id} action={action} />)}
              </Box>
            </Box>
          </Fragment>
        ))}
      </Box>

      <HintLine idle={idleHint} lines={1} />
      {notices}
    </Box>
  );
};

export { StudioTopBar };

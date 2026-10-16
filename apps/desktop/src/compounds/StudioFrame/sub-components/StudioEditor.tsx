/* @layer renderer-components @kind component */
import { Fragment } from 'react';
import { Box, Divider, Text } from '@drizztdourden08/tessera/primitives';
import type { StudioEditorProps } from '../StudioFrame.type';

const StudioEditor = (props: StudioEditorProps) => {
  const { label, toolbar, children } = props;

  return (
    <Box as="section" aria-label={label} className="studio-frame__editor">
      {toolbar && toolbar.length > 0 && (
        <Box role="toolbar" aria-label={label} className="studio-frame__toolbar">
          {toolbar.map((group, index) => (
            <Fragment key={group.id}>
              {index > 0 && <Divider orientation="vertical" />}
              <Box role="group" aria-label={group.label} className="studio-frame__group">
                <Text variant="overline" tone="muted">{group.label}</Text>
                <Box className="studio-frame__group-row">{group.content}</Box>
              </Box>
            </Fragment>
          ))}
        </Box>
      )}
      <Box className="studio-frame__surface">{children}</Box>
    </Box>
  );
};

export { StudioEditor };

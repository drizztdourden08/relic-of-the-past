/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { StudioSection } from '@app/studio';
import type { SectionNoteProps } from './SectionNote.type';

const SectionNote = (props: SectionNoteProps) => {
  const { title, children } = props;

  return (
    <StudioSection title={title}>
      <Text variant="caption" tone="muted">{children}</Text>
    </StudioSection>
  );
};

export { SectionNote };

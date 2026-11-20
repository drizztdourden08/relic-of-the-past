/* @layer renderer-components @kind component */
import { StudioLayout } from '@drizztdourden08/tessera/composites';
import { useT } from '@drizztdourden08/brock-react';
import { STUDIO_EDITOR_MIN_WIDTH, StudioPanelContent } from '@app/studio';
import { DETAILS_PANEL } from './studio-frame/studio-frame.constants';
import type { StudioDetailsLayoutProps } from './StudioDetailsLayout.type';

const StudioDetailsLayout = ({ editorLabel, toolbar, detail, children }: StudioDetailsLayoutProps) => {
  const t = useT();

  return (
    <StudioLayout
      editorLabel={editorLabel}
      compactToolbar
      editorMinWidth={STUDIO_EDITOR_MIN_WIDTH}
      toolbar={toolbar}
      end={{ ...DETAILS_PANEL, title: t('msu-studio:studio.details.title'), content: <StudioPanelContent>{detail}</StudioPanelContent> }}
    >
      {children}
    </StudioLayout>
  );
};

export { StudioDetailsLayout };

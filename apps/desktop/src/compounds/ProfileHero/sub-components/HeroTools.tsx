/* @layer renderer-components @kind component */
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import type { HeroToolsProps } from '../ProfileHero.type';

const HeroTools = ({ canRevealFolder, onOpenFolder, onImportSram }: HeroToolsProps) => (
  <>
    {canRevealFolder && (
      <Button variant="secondary" size="sm" icon={<Icon name="folder-open" />} onClick={onOpenFolder} title="Open this profile's folder">
        Folder
      </Button>
    )}
    <Button variant="secondary" size="sm" icon={<Icon name="download" />} onClick={onImportSram} title="Import a raw SRAM save (.srm) from another emulator">
      Import
    </Button>
  </>
);

export { HeroTools };

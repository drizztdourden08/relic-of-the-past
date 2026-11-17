/* @layer renderer-components @kind types */
import type { MsuManagerModel } from '../../../../msu-studio/msu-manager.type';
import type { PackRemovalBase } from '../pack-removal/pack-removal.type';

type MsuPackActionsParams = PackRemovalBase;

interface MsuListPaneProps {
  msu: MsuManagerModel;
  selected: string | null;
  isInstalled: (name: string) => boolean;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
}

export type { MsuListPaneProps, MsuPackActionsParams };

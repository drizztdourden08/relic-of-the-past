/* @layer renderer-components @kind component */
/**
 * Switches which cartridge kind the import lane below is currently accepting.
 * Labels come from the kind spec (never a hardcoded or commercial-title string).
 */
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { ROM_KIND_LIST } from '@shared/storage/rom-kinds';
import type { RomKind } from '@shared/storage/rom-kinds';

const KIND_OPTIONS = ROM_KIND_LIST.map((spec) => ({ value: spec.kind, label: spec.label }));

interface RomKindTabsProps {
  value: RomKind;
  onChange: (kind: RomKind) => void;
}

const RomKindTabs = (props: RomKindTabsProps) => {
  const { value, onChange } = props;
  return <SegmentedControl value={value} options={KIND_OPTIONS} onChange={onChange} />;
};

export { RomKindTabs };
export type { RomKindTabsProps };

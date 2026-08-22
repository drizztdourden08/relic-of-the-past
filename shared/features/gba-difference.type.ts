/* @layer shared @kind types */
type GbaGroup =
  | 'Extra content' | 'Combat & items' | 'World & exploration'
  | 'Enemies & bosses' | 'Presentation' | 'Audio & voice'
  | 'Text & naming' | 'Save & meta' | 'Fixes' | 'Removed';

/** `evidence` records how far the project actually got: 'extracted' means our own
  * tooling pulled it from the cartridge and can cite an address or table; 'documented'
  * means it is well attested but we have not reproduced it locally yet. */
type GbaDifference = {
  id: string;
  group: GbaGroup;
  label: string;
  detail: string;
  evidence: 'extracted' | 'documented';
};

export type { GbaDifference, GbaGroup };

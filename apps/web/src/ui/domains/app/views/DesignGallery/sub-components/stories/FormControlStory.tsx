/* @layer renderer-app @kind component */
import { useState } from 'react';
import { Box, Toggle, Checkbox, RadioGroup, SegmentedControl, TabBar, ToggleGroup } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

const TOGGLE_OPTIONS = [
  { value: 'sword', label: 'Sword' },
  { value: 'bow', label: 'Bow' },
  { value: 'bombs', label: 'Bombs' },
  { value: 'hookshot', label: 'Hookshot' },
];

const RADIO_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Hard' },
];
const SEGMENTS = [
  { value: 'lw', label: 'Light World' },
  { value: 'dw', label: 'Dark World' },
];
const TABS = [
  { id: 'items', label: 'Items' },
  { id: 'map', label: 'Map' },
  { id: 'log', label: 'Log' },
];

/** Components › selection controls. Active state is always gold. */
const FormControlStory = () => {
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('normal');
  const [seg, setSeg] = useState('lw');
  const [tab, setTab] = useState('items');
  const [multi, setMulti] = useState<string[]>(['sword', 'bombs']);

  return (
    <Box className="dg-stack">
      <Specimen label="Toggle"><Toggle checked={on} onChange={setOn} label="Reduced motion" /></Specimen>
      <Specimen label="Checkbox"><Checkbox checked={checked} onChange={setChecked} label="Show completed checks" /></Specimen>
      <Specimen label="RadioGroup" hint="single choice"><RadioGroup value={radio} options={RADIO_OPTIONS} onChange={setRadio} direction="horizontal" /></Specimen>
      <Specimen label="ToggleGroup" hint="multi-select — selected = gold"><ToggleGroup value={multi} options={TOGGLE_OPTIONS} onChange={setMulti} /></Specimen>
      <Specimen label="SegmentedControl" hint="active = gold"><SegmentedControl value={seg} options={SEGMENTS} onChange={setSeg} /></Specimen>
      <Specimen label="TabBar" hint="active = gold underline"><TabBar tabs={TABS} activeTab={tab} onTabChange={setTab} /></Specimen>
    </Box>
  );
};

export { FormControlStory };

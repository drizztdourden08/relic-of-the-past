/* @layer renderer-app @kind component */
import { useState } from 'react';
import { Box, Field, TextInput, NumberInput, Select, Slider } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

const BOTTLE_OPTIONS = [
  { value: 'red', label: 'Red Potion' },
  { value: 'green', label: 'Green Potion' },
  { value: 'fairy', label: 'Fairy' },
];

/** Components › text / number / select / slider inputs. */
const InputStory = () => {
  const [text, setText] = useState('Link');
  const [num, setNum] = useState(3);
  const [bottle, setBottle] = useState('red');
  const [vol, setVol] = useState(60);

  return (
    <Box className="dg-stack">
      <Specimen label="TextInput"><Field label="Player name"><TextInput value={text} onChange={e => setText(e.target.value)} /></Field></Specimen>
      <Specimen label="NumberInput"><Field label="Hearts"><NumberInput value={num} onChange={setNum} /></Field></Specimen>
      <Specimen label="Select" hint="searchable dropdown"><Field label="Bottle contents"><Select value={bottle} options={BOTTLE_OPTIONS} onChange={setBottle} /></Field></Specimen>
      <Specimen label="Slider"><Slider value={vol} min={0} max={100} onChange={setVol} label="Master volume" showValue /></Specimen>
    </Box>
  );
};

export { InputStory };

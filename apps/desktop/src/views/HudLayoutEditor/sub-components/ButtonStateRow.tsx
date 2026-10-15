/* @layer renderer-components @kind component */
import { Flex, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { faceArtOf } from '@app/hud-layout-editing/node-art';
import { ButtonFaceBody } from './ButtonFaceBody';
import type { ButtonStateRowProps } from './ButtonStateRow.type';

const ButtonStateRow = (props: ButtonStateRowProps) => {
  const { state, required, face, glyphPacks, onChange } = props;
  const art = faceArtOf(face, glyphPacks);

  return (
    <Flex direction="column" gap="2xs" className={`hud-button-state${face ? ' is-set' : ''}`}>
      <Flex gap="2xs" align="center" className="hud-button-state__head">
        <Text className="hud-inspect__sub">{state}</Text>
        {!required && (
          <Toggle
            size="sm"
            checked={face !== undefined}
            label={face ? '' : 'falls back to idle'}
            onChange={(on) => onChange(on ? { from: 'glyph', pack: 'generic', glyph: 'A' } : undefined)}
          />
        )}
      </Flex>
      {face && art && (
        <ButtonFaceBody state={state} face={face} art={art} glyphPacks={glyphPacks} onChange={onChange} />
      )}
    </Flex>
  );
};

export { ButtonStateRow };

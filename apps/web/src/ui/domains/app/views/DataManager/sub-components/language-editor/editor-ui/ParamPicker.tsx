/* @layer renderer-components @kind component */
/**
 * The value list for a toolbar button that cannot act on its own: a text speed
 * needs to know how fast, a glossary insert needs to know which term.
 *
 * The values are handed in, never derived — they come from what the language's
 * own encoder can actually bake, narrowed to the range the catalog publishes, so
 * nothing offered here can fail to compile.
 *
 * It floats over what follows rather than expanding the toolbar, because a
 * toolbar that changes height while being used moves the text away from the
 * pointer.
 *
 * Purely presentational, dismissal included: the button that opened it owns both
 * the open state and the ways of closing (see `ToolbarButton`), because that is
 * the element a press or an Escape actually reaches.
 */
import { Box, ScrollArea, Text } from '@ds/primitives';
import { ParamChoice } from './ParamChoice';
import type { InsertChoice } from '../sub-components/insert-menu.types';
import './ParamPicker.css';

type ParamPickerProps = {
  /** Plain-language name of the thing being given a value. */
  title: string;
  choices: InsertChoice[];
  onPick: (value: string) => void;
};

const ParamPicker = (props: ParamPickerProps) => {
  const { title, choices, onPick } = props;

  return (
    <Box className="param-picker" role="menu" aria-label={title}>
      <Text className="param-picker__title" variant="caption">{title}</Text>
      <ScrollArea className="param-picker__list">
        {choices.map((choice) => (
          <ParamChoice key={choice.value} choice={choice} onPick={onPick} />
        ))}
      </ScrollArea>
    </Box>
  );
};

export { ParamPicker };
export type { ParamPickerProps };

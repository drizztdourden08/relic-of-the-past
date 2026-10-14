/* @layer renderer-components @kind component */
import { Box, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { MAX_NAME_GLYPHS } from '@rotp/languages';
import type { PreviewSamplesProps } from './preview.type';

const PreviewSamples = (props: PreviewSamplesProps) => {
  const { nameSample, digit, onName, onDigit } = props;

  return (
    <Box className="preview-view__samples">
      <Text as="span" variant="caption" className="preview-view__samples-title">
        sample values
      </Text>
      <Box className="preview-view__sample">
        <Text as="span" variant="caption" className="preview-view__sample-label">
          {`player name (${MAX_NAME_GLYPHS} max)`}
        </Text>
        <TextInput value={nameSample} onChange={onName} />
      </Box>
      <Box className="preview-view__sample">
        <Text as="span" variant="caption" className="preview-view__sample-label">number digit</Text>
        <TextInput
          className="preview-view__digit"
          value={digit}
          onChange={onDigit}
        />
      </Box>
    </Box>
  );
};

export { PreviewSamples };

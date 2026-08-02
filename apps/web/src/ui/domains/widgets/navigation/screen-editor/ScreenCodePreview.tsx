/* @layer renderer-widgets @kind component */
/**
 * The wizard's second step: where the record is going, and exactly what will be
 * written there.
 *
 * The text is `serializeScreenRecord`'s own output, so what is shown here is
 * what lands in the file — this panel never re-renders the record its own way.
 * When the draft is incomplete there is no record to serialise and the caller
 * passes the blockers as comment lines instead, which is why the language stays
 * TypeScript in both cases.
 */
import { Box, Text } from '../../../../design-system/primitives';
import { CodeBlock } from '../../../../design-system/composites/CodeBlock';
import '../ScreenEditorDialog.css';

interface ScreenCodePreviewProps {
  /** Serialized record, or the blockers as comments when there is no record. */
  code: string;
  /** Destination relative to the dataset root, or null when none was derived. */
  targetPath: string | null;
  /** Why no destination could be derived; shown in place of one. */
  unresolved?: string;
  /** Failure reported by the last write attempt. */
  error?: string | null;
}

const TARGET = 'Target: ';
const NO_DESTINATION = 'no destination';

const ScreenCodePreview = (props: ScreenCodePreviewProps) => {
  const { code, targetPath, unresolved, error } = props;
  return (
    <Box className="screen-editor__preview">
      <Box className="screen-editor__file-target">
        <Text>{TARGET}</Text>
        <Text as="code">{targetPath ?? `unresolved — ${unresolved ?? NO_DESTINATION}`}</Text>
      </Box>
      <CodeBlock code={code} language="typescript" />
      {error != null && error !== '' && (
        <Text as="p" className="screen-editor__error">{error}</Text>
      )}
    </Box>
  );
};

export { ScreenCodePreview };
export type { ScreenCodePreviewProps };

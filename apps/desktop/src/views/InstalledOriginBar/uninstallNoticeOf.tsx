/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';

const uninstallNoticeOf = (error: string | null) =>
  (error === null ? null : <Text variant="caption" tone="danger" role="alert">{error}</Text>);

export { uninstallNoticeOf };

/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '@rotp/randomizer';
import { NO_SERIALIZER } from '../DataInspector.constants';
import type { InspectorRow, InspectorSource } from '../DataInspector.type';

const tsSourceOf = (source: InspectorSource, record: InspectorRow): string => {
  if (!source.serialize) return optionText(NO_SERIALIZER);
  try {
    return source.serialize(record);
  } catch (error: unknown) {
    return optionText(msg('views-data-inspector:err.emitFailed', { message: error instanceof Error ? error.message : String(error) }));
  }
};

export { tsSourceOf };

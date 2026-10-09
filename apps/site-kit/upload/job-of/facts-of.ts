/* @layer site-kit @kind logic */
import type { FileFacts } from '../upload-record.type';

const factsOf = (file: File): FileFacts => ({ name: file.name, size: file.size, lastModified: file.lastModified, type: file.type });

export { factsOf };

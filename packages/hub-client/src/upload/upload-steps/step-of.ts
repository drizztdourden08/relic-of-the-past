/* @layer site-kit @kind logic */
import type { UploadStep } from '../upload-job.type';

const stepOf = (id: string, label: string): UploadStep => ({ id, label, state: 'pending', detail: null });

export { stepOf };

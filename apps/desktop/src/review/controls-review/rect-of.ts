/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';

const rectOf = (tour: AppReviewTour, selector: string): DOMRect | null => tour.find(selector)?.getBoundingClientRect() ?? null;

export { rectOf };

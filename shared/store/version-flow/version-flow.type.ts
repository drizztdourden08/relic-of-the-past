/* @layer shared-store @kind types */
import type { ReviewState } from '../review-types';
import type { StoreVersion } from '../types';

type VersionAction = 'submit' | 'withdraw' | 'approve' | 'reject' | 'delete' | 'abort';

type Actor = 'author' | 'reviewer';

type FlowStep = { to: ReviewState; by: readonly Actor[] };

type FlowRefusal = 'state' | 'actor' | 'file';

type FlowVersion = Pick<StoreVersion, 'review' | 'removed'>;

type ExpiryVersion = FlowVersion & Pick<StoreVersion, 'createdAt'>;

export type { VersionAction, Actor, FlowStep, FlowRefusal, FlowVersion, ExpiryVersion };

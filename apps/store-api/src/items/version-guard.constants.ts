/* @layer store-api @kind constants */
import type { Actor, VersionAction } from '@rotp/hub-contracts';

const DONE: Record<VersionAction, string> = {
  submit: 'sent for review',
  withdraw: 'withdrawn',
  approve: 'approved',
  reject: 'rejected',
  delete: 'deleted',
  abort: 'cancelled',
};

const WHO: Record<Actor, string> = { author: 'the author', reviewer: 'a reviewer' };

export { DONE, WHO };

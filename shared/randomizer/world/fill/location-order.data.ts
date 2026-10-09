/* @layer shared-game @kind data */
import type { CheckId, RegionId } from '@rotp/game-data';

const REGION_LOCATION_ORDER: Readonly<Partial<Record<RegionId, readonly CheckId[]>>> = {
  'region-167': ['check-132', 'check-133', 'check-134', 'check-130', 'check-131'],
  'region-168': [
    'check-116', 'check-117', 'check-118', 'check-123', 'check-124',
    'check-119', 'check-120', 'check-121', 'check-122',
  ],
  'region-185': ['check-163', 'check-164', 'check-172', 'check-165', 'check-166', 'check-167'],
  'region-187': ['check-177', 'check-178', 'check-182', 'check-183', 'check-179'],
  'region-196': ['check-194', 'check-191', 'check-192'],
  'region-197': ['check-204', 'check-195'],
  'region-199': ['check-196', 'check-207', 'check-197', 'check-198'],
};

export { REGION_LOCATION_ORDER };

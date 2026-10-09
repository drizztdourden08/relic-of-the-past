/* @layer shared-store @kind types */
import type { z } from 'zod';
import type { downloadSchema } from './download-schema';
import type { featuredSchema } from './featured-schema';
import type { itemCreateSchema } from './item-create-schema';
import type { listingPatchSchema } from './listing-patch-schema';
import type { mediaUploadSchema } from './media-upload-schema';
import type { ratingSchema } from './rating-schema';
import type { reviewDecideSchema } from './review-decide-schema';
import type { signPartsSchema } from './sign-parts-schema';
import type { versionBeginSchema } from './version-begin-schema';
import type { versionCompleteSchema } from './version-complete-schema';
import type { welcomeSchema } from './welcome-schema';

type ItemCreateBody = z.infer<typeof itemCreateSchema>;
type MediaUploadBody = z.infer<typeof mediaUploadSchema>;
type ListingPatchBody = z.infer<typeof listingPatchSchema>;
type VersionBeginBody = z.infer<typeof versionBeginSchema>;
type SignPartsBody = z.infer<typeof signPartsSchema>;
type VersionCompleteBody = z.infer<typeof versionCompleteSchema>;
type DownloadBody = z.infer<typeof downloadSchema>;
type RatingBody = z.infer<typeof ratingSchema>;
type ReviewDecideBody = z.infer<typeof reviewDecideSchema>;
type FeaturedBody = z.infer<typeof featuredSchema>;
type WelcomeBody = z.infer<typeof welcomeSchema>;

export type {
  ItemCreateBody,
  MediaUploadBody,
  ListingPatchBody,
  VersionBeginBody,
  SignPartsBody,
  VersionCompleteBody,
  DownloadBody,
  RatingBody,
  ReviewDecideBody,
  FeaturedBody,
  WelcomeBody,
};

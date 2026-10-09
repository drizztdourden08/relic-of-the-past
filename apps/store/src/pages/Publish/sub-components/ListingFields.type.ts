/* @layer store-site @kind types */
import type { FieldErrors, FieldKey } from '../Publish.type';
import type { ListingFieldsState } from '../behavior/useListingFields.type';

type ListingFieldsProps = {
  listing: ListingFieldsState;
  errors: FieldErrors;
  onLeave: (field: FieldKey) => void;
};

export type { ListingFieldsProps };

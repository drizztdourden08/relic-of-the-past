/* @layer store-site @kind component */
import { StatRow } from '@drizztdourden08/tessera/primitives';
import { NoteBox, TagList } from '@rotp/design';
import type { ListingEditPreviewProps } from './ListingEditPreview.type';

const ListingTextChanges = (props: ListingEditPreviewProps) => {
  const { item, edit } = props;
  const { patch } = edit;
  return (
    <>
      {patch.name !== undefined && <StatRow label="name" value={`${item.name} -> ${patch.name}`} />}
      {patch.summary !== undefined && <StatRow label="one line" value={patch.summary} />}
      {patch.license !== undefined && <StatRow label="licence" value={`${item.license} -> ${patch.license}`} />}
      {patch.tags !== undefined && <StatRow label="tags" value={<TagList tags={patch.tags} />} />}
      {patch.color !== undefined && <StatRow label="colour" value={`${item.color} -> ${patch.color}`} mono />}
      {patch.description !== undefined && <NoteBox>{patch.description || 'Description removed.'}</NoteBox>}
    </>
  );
};

export { ListingTextChanges };

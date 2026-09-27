/* @layer store-site @kind component */
/**
 * The pack uploads, as the kit's panel in a side column: shown while any upload row is
 * left and not closed. Closing hides it until the next upload starts. `children` are the
 * page's own side panels, drawn under it.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { SideColumn } from '@site-kit/layout/SideColumn/SideColumn';
import { UploadsPanel } from '@site-kit/components/UploadsPanel/UploadsPanel';
import { useStoreData } from '../data/store-data-context';

type UploadsColumnProps = { children?: ReactNode };

const UploadsColumn = (props: UploadsColumnProps) => {
  const { children } = props;
  const { uploads } = useStoreData();
  const newest = uploads.jobs[0]?.id ?? null;
  const [closedAt, setClosedAt] = useState<string | null>(null);
  const showUploads = newest !== null && closedAt !== newest;
  if (!showUploads && !children) return null;
  return (
    <SideColumn>
      {showUploads && (
        <UploadsPanel
          jobs={uploads.jobs}
          onDismiss={uploads.dismiss}
          onClearFinished={uploads.clearFinished}
          onClose={() => setClosedAt(newest)}
        />
      )}
      {children}
    </SideColumn>
  );
};

export { UploadsColumn };
export type { UploadsColumnProps };

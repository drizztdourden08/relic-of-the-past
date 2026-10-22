/* @layer renderer-app @kind component */
import type { CardProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { FreeWindow } from '@app/shell/free-window';
import { DataInspector } from '@app/views/DataInspector';

const meta: ScreenMeta = { title: 'Data Inspector', icon: 'search', menu: 'Advanced', requiresProfile: false, keywords: ['dataset', 'records', 'checks', 'screens', 'actors', 'inspector'] };

const DataInspectorLayer = (props: CardProps) => (
  <FreeWindow title={meta.title ?? 'Data Inspector'} onClose={props.close}><DataInspector /></FreeWindow>
);

export default DataInspectorLayer;
export { meta };

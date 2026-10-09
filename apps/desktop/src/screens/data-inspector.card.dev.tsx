/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { DataInspector } from '@app/views/DataInspector';

const meta: ScreenMeta = { title: 'Data Inspector', icon: 'search', menu: 'Advanced', requiresProfile: false, keywords: ['dataset', 'records', 'checks', 'screens', 'actors', 'inspector'] };

const DataInspectorCard = () => <DataInspector />;

export default DataInspectorCard;
export { meta };

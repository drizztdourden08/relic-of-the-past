/* @layer renderer-appshell @kind component */
import { AppMain } from '../ui/domains/app/views/AppMain';

/**
 * App — thin tunnel into the renderer. All shell orchestration and layout live
 * in the `app/main` view (domains/app/views/AppMain); this entry just mounts it.
 */
const App = () => <AppMain />;

export { App };

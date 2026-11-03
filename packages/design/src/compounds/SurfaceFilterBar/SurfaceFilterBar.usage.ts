/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The search box and filter controls above a table, with the saved views menu beside them.',
  useWhen: ['The toolbar of a table whose view state comes from useSurfaceView.'],
  avoidWhen: [{ case: 'A filter bar that keeps no saved views.', use: 'FilterBar' }],
  rules: ['Pass the view that useSurfaceView returns and the schema the table uses.'],
  a11y: ['The search field is labelled by the label prop; the saved views menu is a menu button.'],
  buildingBlock: true,
  example: `import { SurfaceFilterBar } from '@rotp/design';\n\nconst Bar = () => <SurfaceFilterBar schema={schema} view={view} placeholder="Search..." label="Search rows" />;\n`,
  propsHash: '123202a053df9df4',
} satisfies ComponentUsage;

export { usage };

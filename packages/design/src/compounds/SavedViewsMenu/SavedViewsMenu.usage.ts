/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A menu to save, apply, update, rename and delete the saved views of a table, kept per person on the hub.',
  useWhen: ['The toolbar of a table whose columns, sort and filters a person may want to keep.'],
  avoidWhen: [{ case: 'A one-off filter that is not kept.', use: 'SearchInput' }],
  rules: [
    'Pass the state that useSavedViews returns for the surface of the table.',
    'Show it once per table, beside the filter controls.',
  ],
  a11y: ['It is a menu button; the name dialog moves focus into its field and returns it on close.'],
  buildingBlock: true,
  example: `import { SavedViewsMenu } from '@rotp/design';\n\nconst ViewsMenu = (props: Parameters<typeof SavedViewsMenu>[0]) => <SavedViewsMenu state={props.state} />;\n`,
  propsHash: '9dd8c79891af6c4f',
} satisfies ComponentUsage;

export { usage };

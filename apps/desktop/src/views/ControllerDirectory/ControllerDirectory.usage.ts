/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The controller directory: a searchable table of the controllers SDL3 knows, connected ones first, each connected one opening its own page.',
  useWhen: ['As the body of the Directory page of the Controllers area.'],
  avoidWhen: [{ case: 'The live input of one connected controller.', use: 'ControllerSilhouette' }],
  rules: [
    'Pass onOpenController to open the page of a connected controller from its row.',
    'Every mapping SDL3 knows lists under Known; every connected controller lists under Connected, mapped or not.',
    'The Rescan button sits at the end of the search and filter row.',
  ],
  a11y: ['The search field is labelled; the table rows are selectable only for connected controllers.'],
  buildingBlock: true,
  example: `import { ControllerDirectory } from '@app/views/ControllerDirectory';\n\nconst Directory = ({ open }: { open: (deviceKey: string) => void }) => <ControllerDirectory onOpenController={open} />;\n`,
  propsHash: '8a94dec070d636fa',
} satisfies ComponentUsage;

export { usage };

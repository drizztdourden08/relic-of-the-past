/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The frame of a studio: a labelled top bar with the file actions and a hint line, a left panel, a framed editor with its toolbar on top, and a right panel.',
  useWhen: [
    'As the whole body of a studio page, such as the character, language or music studio.',
    'When the studio has a list of things to pick, an editing area and the properties of the selection.',
  ],
  avoidWhen: [
    { case: 'A page of records in a table.', use: 'ListDetailLayout' },
    { case: 'Two panes that resize against each other.', use: 'SplitPane' },
  ],
  rules: [
    'caption names the studio and title names what is open, such as the sprite or the pack.',
    'groups are the top bar actions. Name each group by where its result goes, such as Save to this app and Export a file.',
    'Every action carries a hint: a short label and one plain sentence. The hint shows in the bar while the action is hovered or focused.',
    'idleHint shows when no action is hovered. Use it to say what save keeps and what export makes.',
    'toolbar groups sit on the top edge of the editor. Put the tools of the editing area there and nothing else.',
    'left holds the list of things to pick and right holds the properties of the selection. Leave one out when the studio has no use for it.',
    'Put lists and text areas in StudioWell so they read as sunken against the raised panel.',
    'notices takes status and error lines. banner takes a full width bar, such as the origin of an installed item.',
  ],
  a11y: [
    'The top bar is a header, each panel is an aside named by its title, and the editor is a section named by editorLabel.',
    'Each action group and each toolbar group is a labelled group.',
    'The collapse buttons of the panels name the panel and report aria-expanded.',
  ],
  buildingBlock: true,
  example: `import { StudioFrame, StudioWell } from '@app/compounds/StudioFrame';

const Mounted = () => (
  <StudioFrame
    caption="Example Studio"
    title="Untitled"
    groups={[{
      id: 'save',
      label: 'Save to this app',
      actions: [{ id: 'save', label: 'Save', hint: { label: 'Save', description: 'Keeps your changes in this app.' }, onSelect: () => undefined }],
    }]}
    idleHint="Save keeps it in this app. Export makes a file to share."
    left={{ title: 'Items', content: <StudioWell>Pick one</StudioWell> }}
    right={{ title: 'Properties', content: <StudioWell>Details</StudioWell> }}
    editorLabel="Editor"
    toolbar={[{ id: 'view', label: 'View', content: 'Tools' }]}
  >
    The work surface
  </StudioFrame>
);
`,
  propsHash: 'aa223f0a195dbf78',
} satisfies ComponentUsage;

export { usage };

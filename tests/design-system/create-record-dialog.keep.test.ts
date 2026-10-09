/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CreateRecordDialog } from '../../apps/web/src/ui/design-system/composites/CreateRecordDialog';
import { useCreateFormState } from '../../apps/web/src/ui/design-system/composites/CreateRecordDialog/behavior/use-create-form-state';

describe('CreateRecordDialog renders nothing at all while closed', () => {
  it('never reaches the Portal-bound chrome when closed', () => {
    const markup = renderToStaticMarkup(createElement(CreateRecordDialog, {
      open: false,
      title: 'New thing',
      schema: [],
      initialRecord: {},
      requiredPaths: ['label'],
      onCreate: async () => ({ success: true, id: 'x-001' }),
      onCreated: () => undefined,
      onCancel: () => undefined,
    }));
    expect(markup).toBe('');
  });
});

const Probe = (props: { initialRecord: Record<string, unknown>; requiredPaths: readonly string[] }) => {
  const { isComplete } = useCreateFormState({
    initialRecord: props.initialRecord,
    requiredPaths: props.requiredPaths,
    open: true,
    onCreate: async () => ({ success: true, id: 'x-001' }),
  });
  return createElement('span', null, isComplete ? 'complete' : 'incomplete');
};

const gate = (initialRecord: Record<string, unknown>, requiredPaths: readonly string[]): string =>
  renderToStaticMarkup(createElement(Probe, { initialRecord, requiredPaths }));

describe('useCreateFormState gates completeness on the required paths', () => {
  it('is incomplete when a required field is blank', () => {
    expect(gate({ label: '' }, ['label'])).toContain('incomplete');
  });

  it('is incomplete when a required field is absent entirely', () => {
    expect(gate({}, ['label'])).toContain('incomplete');
  });

  it('is complete once every required field holds a value', () => {
    expect(gate({ label: 'Something' }, ['label'])).toBe('<span>complete</span>');
  });

  it('is complete with no required paths at all, regardless of the draft', () => {
    expect(gate({}, [])).toBe('<span>complete</span>');
  });

  it('treats a number and a boolean as filled even at their zero/false value', () => {
    expect(gate({ count: 0, flag: false }, ['count', 'flag'])).toBe('<span>complete</span>');
  });

  it('is incomplete when only SOME of several required paths are filled', () => {
    expect(gate({ label: 'Something', world: '' }, ['label', 'world'])).toContain('incomplete');
  });
});

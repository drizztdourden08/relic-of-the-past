/* @layer renderer-components @kind logic */
import type { DiagnosticsWizardState } from '../diagnostics-wizard.type';

const layoutDeviceName = (wizard: DiagnosticsWizardState): string => (
  wizard.capturedLayout?.resolved.name ?? wizard.selectedChooser?.name ?? wizard.selectedChooser?.product ?? 'controller'
);

export { layoutDeviceName };

/* @layer renderer-app @kind entry */
import '@drizztdourden08/tessera/tokens.css';
import '../.brock/palette.css';
import './theme.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrockApp } from '@drizztdourden08/brock-react';
import { rendererModules } from '../.brock/modules.renderer';
import { rendererBootTasks } from '../.brock/boot.renderer';
import { screenTree } from '../.brock/screens';
import { appWidgetLayout, appWidgets } from '../.brock/widgets';
import { appReview } from '../.brock/review';
import { appTitleBar } from '../.brock/title-bar';
import { appTours } from '../.brock/tours';
import { installAppShim } from './platform/api-shim';
import { rotpShellModule } from './shell/rotp-shell-module';
import { rotpProfileHooks } from './profiles/rotp-profile-hooks';
import { useWidgetDisabled } from './widget-gates/useWidgetDisabled';
import { SETTINGS } from './main.constants';
import { LEGAL_TEXT } from './legal.constants';
import { product } from './product';
import type { AppSettings } from './settings.type';
import './log-bus';
import './hud/hud.css';
import './theme/hud-layout-editor/hud-layout-editor.css';
import './theme/data-manager/data-manager.css';
import './theme/dialogue-editor/lines.css';
import './theme/input-calibration/input-calibration.css';
import './theme/msu-studio/msu-studio.css';
import './theme/msu-studio/msu-files.css';

installAppShim();

const modules = [...rendererModules, rotpShellModule];

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <BrockApp<AppSettings>
      product={product}
      settings={SETTINGS}
      screenTree={screenTree}
      modules={modules}
      bootTasks={rendererBootTasks}
      widgets={appWidgets}
      widgetLayout={appWidgetLayout}
      widgetDisabled={useWidgetDisabled}
      review={appReview}
      titleBar={appTitleBar}
      tours={appTours}
      profileHooks={rotpProfileHooks}
      legalText={LEGAL_TEXT}
    />
  </StrictMode>,
);

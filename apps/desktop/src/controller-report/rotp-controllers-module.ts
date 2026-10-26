/* @layer renderer-app @kind config */
import type { RendererModule } from '@drizztdourden08/brock-react';
import { ControllerReportHost } from './ControllerReportHost';

const rotpControllersModule: RendererModule = {
  id: 'rotp-controllers',
  Provider: ControllerReportHost,
};

export { rotpControllersModule };

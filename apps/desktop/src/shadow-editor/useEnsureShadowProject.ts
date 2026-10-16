/* @layer renderer-app @kind hook */
import { useEffect } from 'react';
import { ensureShadowProject } from './ensure-shadow-project';

const useEnsureShadowProject = (): void => {
  useEffect(ensureShadowProject, []);
};

export { useEnsureShadowProject };

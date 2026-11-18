/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { GlobalAppLanguageControl } from '@app/app-language';

const renderLanguageControl = (key: string): ReactNode | null => (key === 'appLanguage' ? createElement(GlobalAppLanguageControl) : null);

export { renderLanguageControl };

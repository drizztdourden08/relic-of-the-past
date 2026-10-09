/* @layer renderer-lib @kind logic */
import type { DebugSection } from './section.type';

const renderSections = (sections: DebugSection[]): string =>
  sections
    .filter((entry) => entry.lines.length > 0)
    .map((entry) => [`[${entry.title}]`, ...entry.lines].join('\n'))
    .join('\n\n');

export { renderSections };

/* @layer tooling-scripts @kind logic */
import fs from 'fs';
import path from 'path';
import { classifyLang, classifyRole, classifyType, readLayerTag } from './classify-rules.mjs';
import { matchManifest } from './manifest.mjs';
import { isVendored } from './policy.mjs';

const codeLineCount = (content) =>
  content.split('\n').filter((l) => l.trim() && !/^\s*(\/\/|\*|\/\*|\*\/|#|REM|<!--)/.test(l)).length;

const classifyFile = (root, rel, manifest) => {
  const lang = classifyLang(rel);
  const role = classifyRole(rel);
  const man = matchManifest(manifest, rel);
  let raw = 0, code = 0, headerLayer = null, heur = { type: 'asset', source: 'heuristic' };

  if (lang !== 'Binary') {
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    raw = content.split('\n').length;
    code = codeLineCount(content);
    headerLayer = readLayerTag(content);
    heur = classifyType(rel, content);
  }

  const kind = man.kind ?? heur.type;
  const layer = man.layer ?? headerLayer ?? role;
  const tagSource = man.kind || man.layer ? 'manifest'
    : (heur.source === 'tag' || headerLayer) ? 'header'
      : 'heuristic';

  return { rel, lang, layer, role, kind, tagSource, vendored: man.vendored ?? isVendored(rel), raw, code };
};

export { classifyFile };

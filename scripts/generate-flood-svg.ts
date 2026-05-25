import { loadRom } from '../shared/asset-extraction/rom/rom-loader';
import { floodFillScreen, initEngine } from '../shared/game/navigation/flood-fill';
import { findBorderBundles, computeOverlap } from '../shared/game/navigation/analysis/border-bundles';
import { getScreenName } from '../shared/game/navigation/screen-names';
import { writeFileSync } from 'fs';

const rom = loadRom('./test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc');
initEngine(rom);

const inventory = new Set(['lift.1']);

interface Edge { from: number; to: number; dir: string }
const visited = new Set<number>();
const edges: Edge[] = [];
const queue: { screen: number; entry?: { row: number; col: number } }[] = [
  { screen: 0x2C, entry: { row: 50, col: 30 } }
];

while (queue.length > 0) {
  const { screen, entry } = queue.shift()!;
  if (visited.has(screen)) continue;
  visited.add(screen);

  const result = floodFillScreen(rom, screen, inventory, entry);
  const bundles = findBorderBundles(result);

  for (const bundle of bundles) {
    const row = screen >> 3, col = screen & 7;
    let ns: number | null = null;
    if (bundle.direction === 'n' && row > 0) ns = ((row - 1) << 3) | col;
    if (bundle.direction === 's' && row < 7) ns = ((row + 1) << 3) | col;
    if (bundle.direction === 'e' && col < 7) ns = (row << 3) | (col + 1);
    if (bundle.direction === 'w' && col > 0) ns = (row << 3) | (col - 1);
    if (ns === null || ns < 0 || ns > 0x3F) continue;

    const mid = bundle.tiles[Math.floor(bundle.tiles.length / 2)];
    const neighborEntry = bundle.direction === 'n' ? { row: 63, col: mid }
      : bundle.direction === 's' ? { row: 0, col: mid }
      : bundle.direction === 'e' ? { row: mid, col: 0 }
      : { row: mid, col: 63 };
    const opp = bundle.direction === 'n' ? 's' : bundle.direction === 's' ? 'n' : bundle.direction === 'e' ? 'w' : 'e';

    const nr = floodFillScreen(rom, ns, inventory, neighborEntry);
    const nb = findBorderBundles(nr).filter(b => b.direction === opp);
    let connected = false;
    for (const n of nb) {
      if (computeOverlap(bundle.tiles, n.tiles).length > 0) {
        connected = true;
        break;
      }
    }

    if (connected) {
      edges.push({ from: screen, to: ns, dir: bundle.direction });
      if (!visited.has(ns)) {
        queue.push({ screen: ns, entry: neighborEntry });
      }
    }
  }
}

// Generate SVG
const cellW = 120, cellH = 70, padX = 40, padY = 40;
const svgW = 8 * cellW + 2 * padX;
const svgH = 8 * cellH + 2 * padY;

const reachedSet = visited;
const unreached = new Set<number>();
for (let i = 0; i < 64; i++) if (!reachedSet.has(i)) unreached.add(i);

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" font-family="monospace" font-size="10">\n`;
svg += `<rect width="${svgW}" height="${svgH}" fill="#1a1a2e"/>\n`;
svg += `<text x="${svgW/2}" y="20" text-anchor="middle" fill="#fff" font-size="14">LW Overworld — Reachable from Link's House (lift.1)</text>\n`;

// Draw edges first (behind cells)
svg += `<g stroke-width="2" fill="none">\n`;
for (const e of edges) {
  const fromRow = e.from >> 3, fromCol = e.from & 7;
  const toRow = e.to >> 3, toCol = e.to & 7;
  const x1 = padX + fromCol * cellW + cellW / 2;
  const y1 = padY + fromRow * cellH + cellH / 2;
  const x2 = padX + toCol * cellW + cellW / 2;
  const y2 = padY + toRow * cellH + cellH / 2;
  const color = reachedSet.has(e.from) && reachedSet.has(e.to) ? '#4ecdc4' : '#555';
  svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" opacity="0.6"/>\n`;
}
svg += `</g>\n`;

// Draw cells
for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const idx = (row << 3) | col;
    const x = padX + col * cellW;
    const y = padY + row * cellH;
    const name = getScreenName(idx);
    const hex = `0x${idx.toString(16).padStart(2, '0')}`;

    let fill: string, textFill: string, strokeColor: string;
    if (idx === 0x2C) {
      fill = '#e63946'; textFill = '#fff'; strokeColor = '#ff6b6b'; // start
    } else if (reachedSet.has(idx)) {
      fill = '#2d6a4f'; textFill = '#d8f3dc'; strokeColor = '#52b788'; // reachable
    } else {
      fill = '#2b2b3d'; textFill = '#666'; strokeColor = '#444'; // unreachable
    }

    svg += `  <rect x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${cellH - 4}" fill="${fill}" stroke="${strokeColor}" rx="4"/>\n`;
    svg += `  <text x="${x + cellW / 2}" y="${y + 18}" text-anchor="middle" fill="${textFill}" font-size="9" font-weight="bold">${hex}</text>\n`;
    svg += `  <text x="${x + cellW / 2}" y="${y + 32}" text-anchor="middle" fill="${textFill}" font-size="8">${name.length > 16 ? name.slice(0, 15) + '…' : name}</text>\n`;

    // Show border directions for reached screens
    if (reachedSet.has(idx)) {
      const screenEdges = edges.filter(e => e.from === idx);
      const dirs = screenEdges.map(e => e.dir[0].toUpperCase()).join(' ');
      svg += `  <text x="${x + cellW / 2}" y="${y + 46}" text-anchor="middle" fill="${textFill}" font-size="8" opacity="0.7">→ ${dirs}</text>\n`;
    }
  }
}

// Legend
svg += `<rect x="${padX}" y="${svgH - 30}" width="12" height="12" fill="#e63946" rx="2"/>\n`;
svg += `<text x="${padX + 16}" y="${svgH - 20}" fill="#fff" font-size="9">Start (Link's House)</text>\n`;
svg += `<rect x="${padX + 150}" y="${svgH - 30}" width="12" height="12" fill="#2d6a4f" stroke="#52b788" rx="2"/>\n`;
svg += `<text x="${padX + 166}" y="${svgH - 20}" fill="#fff" font-size="9">Reachable (${reachedSet.size})</text>\n`;
svg += `<rect x="${padX + 300}" y="${svgH - 30}" width="12" height="12" fill="#2b2b3d" stroke="#444" rx="2"/>\n`;
svg += `<text x="${padX + 316}" y="${svgH - 20}" fill="#fff" font-size="9">Unreachable (${unreached.size}) — needs cave/entrance</text>\n`;

svg += `</svg>\n`;

writeFileSync('scripts/lw-flood-map.svg', svg);
console.log(`SVG written: scripts/lw-flood-map.svg`);
console.log(`Reached: ${reachedSet.size}, Edges: ${edges.length}, Unreachable: ${unreached.size}`);

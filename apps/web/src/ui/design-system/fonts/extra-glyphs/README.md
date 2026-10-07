<!-- @layer renderer-design-system @kind doc -->
# Added glyphs for the dialogue face

The original face has no glyph for these printable ASCII characters:

`#` `$` `%` `&` `*` `+` `/` `;` `=` `@` `[` `\` `]` `^` `_` `` ` `` `{` `}` `~`

Each SVG here is the source outline for one of them, and `alttp-ext.woff2` in the parent folder carries them. The shapes are the bodies of the in-game glyphs in `shared/game/dialog/extra-glyphs.data.ts`, so the web face and the game's dialog box draw the same letters. The dark edge of the in-game glyphs is left out: on the web, the `.game-text` stroke draws it.

`preview.svg` shows every glyph on its pixel grid.

## Coordinate system

- The viewBox is in game pixels: `0 0 <advance> 16`, the same 8 by 16 cell the game uses.
- Row 0 is the top of the cell. Capitals start on row 2, the baseline is the bottom edge of row 12 (y = 13), and descenders reach row 14.
- The body starts on column 1, like the face's own letters.
- `data-advance` is the pen advance in pixels and equals the viewBox width. `data-char` is the code point.
- The path is axis-aligned: `M`, `H`, `V` and `Z` only, with outer contours clockwise and holes counter-clockwise.

## Mapping to font units

The font has 2000 units per em and one game pixel is 125 units.

```
fontX = x * 125
fontY = (13 - y) * 125
advance = data-advance * 125
```

## Face metrics, in game pixels

| Metric | Pixels | Units |
|--------|--------|-------|
| Cap height | 11 | 1375 |
| x-height | 8 | 1000 |
| Descender | 2 | -250 |
| Ascender (hhea) | 13 | 1625 |
| Common advance | 6 | 750 |

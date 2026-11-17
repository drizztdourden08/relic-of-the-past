<!-- @layer renderer-design-system @kind doc -->
# Japanese dialogue face

`alttp-ja.woff2` is the web face for Japanese game text. It is separate from the Latin face in `../latin/` and never merged into it: each script keeps its own folder, glyph sources and build.

The glyphs are original drawings made for this project on the game's 11 by 16 pixel grid. The in-game Japanese letters were used only as a coverage checklist; none was traced or copied, and no game data is stored here.

`game-font-ja.css` declares the face as `ALttP Japanese` and, under `:lang(ja)`, puts it ahead of the Latin face in `--font-game`. Anything the face lacks (for example Latin capitals) falls back to `ALttP Dialogue`, then to the mono stack.

## Coverage

| Group | Folder | Glyphs |
|-------|--------|--------|
| Hiragana, small kana and voiced forms | `glyphs/hiragana/` | 81 |
| Katakana, small kana, voiced forms and ヴ | `glyphs/katakana/` | 84 |
| Digits 0-9 | `glyphs/digits/` | 10 |
| Punctuation `『』、。ー…〜 ! ?` (plus `~`, `！`, `？`, ideographic space) | `glyphs/punctuation/` | 14 |
| Kanji (every kanji the game uses, see below) | `glyphs/kanji/` | 260 |

Kanji covered: 260 characters (the 25 basic ones plus the rest of the set the game uses, stored in the ROM as unnamed glyph numbers 0x100 and up; the glyph-number-to-character table lives in `@rotp/asset-extraction`). Each is an original drawing from standard stroke structure, never traced.

## Coordinate system

- The viewBox is `0 0 11 16`: the game's 11 pixel wide letter cell. `data-advance` is 11 and `data-char` is the code point.
- Row 0 is the top. The baseline is the bottom edge of row 12 (y = 13). Kana bodies are 8 by 9 pixels from row 4; small kana are 6 by 6 from row 7; voiced marks sit in rows 1 to 3 at columns 8 to 10. Kanji are 10 by 12 from row 2.
- Paths are axis-aligned (`M`, `H`, `V`, `Z`), one rectangle per pixel run.
- Font units: 2000 per em, one game pixel is 125 units, `fontX = x * 125`, `fontY = (13 - y) * 125`.

## Adding a glyph

1. Copy a neighbouring SVG into the matching `glyphs/<group>/` folder and name it after the character.
2. Set `data-char` and the `<title>`, then redraw the pixel runs on the grid above.
3. Rebuild the woff2 and update the counts here.

## Rebuilding `alttp-ja.woff2`

Needs Python with `fonttools` and `brotli`. For every `glyphs/*/*.svg`, read `data-char`, `data-advance` and each `M x y H x2 V y2 H x Z` run, draw it as a clockwise rectangle (`TTGlyphPen`: `moveTo(x0,bot) lineTo(x0,top) lineTo(x1,top) lineTo(x1,bot)`, top = (13 - y) * 125, bottom = (13 - (y + 1)) * 125), name the glyph `uniXXXX`, map it in the cmap, then build with `FontBuilder(2000, isTTF=True)` (ascent 1625, descent -375, family `ALttP Japanese`), set `font.flavor = 'woff2'` and save over `alttp-ja.woff2`.

## License

Original work released under the project's MIT license (`LICENSE.txt`).

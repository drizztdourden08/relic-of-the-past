<!-- @layer docs @kind doc -->
# Code notes: apps/website

Facts about `apps/website/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/website/src/downloads/downloads.constants.ts

The matchers list the preferred download first for each platform, and that order is the order the buttons show.
The internal assets are what the Windows installer stub fetches (the payload and the directory zip) and the input addon tarball a fresh clone fetches. The tarball matches the Linux archive rule, so it is filtered out before any matcher runs.

## apps/website/src/components/Hero/sub-components/Fireflies/fireflies.constants.ts

The fireflies are a fixed table with no runtime randomness, so the scene is the same on every render.
The glow is a ring of hard-edged shadow cells on the firefly's own grid (1em is its size), stepping down in brightness, with no blur.

## apps/website/src/components/Separator/behavior/diamond-path.ts

The gem is a stepped pixel diamond drawn on a 3 px cell grid: the cells where the distance from the centre is at most the radius, traced clockwise from the top cell.

## apps/website/src/components/CommunitySection/sub-components/CommunityTexture/pseudo-random.ts

A seeded hash stands in for a random number so the triforce scatter is stable across renders. A negative animation delay starts each triforce mid-cycle so the pulses are out of step.

## apps/website/src/views/LandingPage/LandingPage.css

The Tessera reset locks the html, body and root to the window height with no scrolling, since a desktop app scrolls inside its panes. The landing page scrolls inside its own root element, and the separator boundaries are lifted half their height so the gem sits on the section edge.

## apps/website/public

The files here are served from the site root. `favicon.ico` and the logo PNGs are linked from `index.html`, and `media/` holds the hero art and the feature screenshots.
The site is served at the domain root (relic-of-the-past.com) from the gh-pages branch of this repository, so asset paths are root-relative.

// @layer installer @kind types
#pragma once

#include <objidl.h>
#include <gdiplus.h>

#include <vector>

#include "paint.h"

namespace ui {

// Draws one whole frame in logical coordinates. The caller supplies whatever
// transform maps that onto the real surface.
void PaintFrame(Gdiplus::Graphics& g, const State& s, std::vector<Hit>* hits);

}  // namespace ui

<!-- @layer docs @kind doc -->
# Third-Party Notices

This app is MIT-licensed (see [`LICENSE`](https://github.com/drizztdourden08/relic-of-the-past/blob/master/LICENSE)
in the repo root), and bundles the third-party components listed below. Each keeps its own
license, reproduced or linked here as required.

## SDL3

- **What it is:** the library used to read and rumble controllers.
- **License:** zlib.
- **How it's shipped:** built from SDL's official released source, unmodified. On desktop it
  is a dynamic library (`SDL3.dll` on Windows, the platform equivalent elsewhere). On Android
  it is compiled into the app's controller plugin, together with SDL's own Java classes, which
  are taken straight from that same released source when the app is built. No part of SDL is
  copied into this project's own source, and nothing in it has been changed.
- **Source:** <https://github.com/libsdl-org/SDL>
- **Copyright:** Copyright (C) 1997-2026 Sam Lantinga.

```
This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
```

## libusb

- **What it is:** the low-level USB access library SDL3 uses (as an optional backend) to
  reach controllers that need it, mainly newer Nintendo pads.
- **License:** GNU Lesser General Public License, version 2.1 (LGPL-2.1).
- **How it's shipped:** **unmodified**, as a separate dynamic library that SDL3 loads at
  runtime, alongside the app's controller support on every desktop platform:
  `libusb-1.0.dll` on Windows, `libusb-1.0.so.0` on Linux, and `libusb-1.0.0.dylib` on
  macOS. It is dynamically linked, never compiled into the app or into SDL3 itself, and
  nothing in it has been changed from the upstream release. On Windows it is built from
  libusb's official released source; on Linux and macOS it is the distribution's own build
  of the same pinned version.
- **Source:** <https://github.com/libusb/libusb> (the exact version this app pins is recorded
  in the repo at `apps/desktop/electron/input/native/sdl3/package.json`).
- **Your rights under the LGPL:** because the library is dynamically linked, you may replace
  the shipped library with your own build of libusb (for example, one built from a modified
  copy of the libusb source) and the app will load it in place of the bundled one. It sits
  next to the app's controller module, under the platform name listed above.
- **Copyright:** the libusb project and contributors; see the full license text at
  <https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.

## hidapi (bundled inside SDL3)

- **What it is:** a small HID device library vendored inside SDL3's own source tree; SDL3
  uses it as part of its controller backend.
- **License:** hidapi is offered under a choice of licenses upstream. This app uses it under
  the **BSD-style license** (the same permissive terms used elsewhere in this project's stack).
- **Copyright:** Copyright (c) 2010, Alan Ott, Signal 11 Software. All rights reserved.

```
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of Signal 11 Software nor the names of its
      contributors may be used to endorse or promote products derived from
      this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

## Game controller database

- **What it is:** `resources/gamecontrollerdb.txt`, a community-maintained list of controller
  button mappings that SDL3 uses to recognize specific controller models. It ships as a plain
  text file inside the installer, not as code.
- **License:** zlib.
- **Source:** <https://github.com/mdqinc/SDL_GameControllerDB>

## The game core

- `core/zelda3/` is a vendored decompilation of the original game engine and keeps its own
  license; see `core/zelda3/LICENSE.txt`. This app ships no game data. You supply your own
  legally obtained copy of the original game.

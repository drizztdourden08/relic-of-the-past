/* @layer electron-main @kind native */
// Declarations for the N-API handler functions defined outside addon.cc, in
// their own translation units to keep each file under the line cap. Wired
// into the exports table by Init() in addon.cc. GetSdlThread is how they
// reach the single SdlThread instance addon.cc owns.
#pragma once

#include <napi.h>

#include "sdl-thread.h"

// Returns the current SdlThread instance, or nullptr if none exists yet.
// Pass createIfMissing to lazily construct one, appropriate for read-only
// queries (mirrors EnumerateHid's existing behaviour), not for stop/action
// calls that should be a no-op when nothing was ever started.
SdlThread* GetSdlThread(bool createIfMissing);

Napi::Value StartRawCapture(const Napi::CallbackInfo& info);
Napi::Value StopRawCapture(const Napi::CallbackInfo& info);
Napi::Value StartJoystickCapture(const Napi::CallbackInfo& info);
Napi::Value StopJoystickCapture(const Napi::CallbackInfo& info);
Napi::Value ListJoysticks(const Napi::CallbackInfo& info);
Napi::Value MappingForGuid(const Napi::CallbackInfo& info);

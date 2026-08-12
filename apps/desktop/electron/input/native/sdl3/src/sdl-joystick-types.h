/* @layer electron-main @kind native */
// Data types for joystick-level tracking: the snapshot listJoysticks()
// returns, the periodic capture event, and the state kept between ticks.
// Split out of sdl-thread.h to keep that file under the line cap.
#pragma once

#include <cstdint>
#include <string>
#include <vector>

// One entry of listJoysticks(): every joystick SDL currently has open,
// whether or not it also has a gamepad mapping. This is what makes a
// controller with no mapping visible at all, unlike the gamepad-only path,
// which never sees it.
struct JoystickInfo {
  int32_t id = 0;
  std::string name;
  std::string guid;
  int32_t numButtons = 0;
  int32_t numAxes = 0;
  int32_t numHats = 0;
  bool hasGamepadMapping = false;
};

// One joystick-level state sample, built from SDL_GetJoystickButton/Axis/Hat
// and emitted only while capture is active on this id.
struct JoystickStateEvent {
  int32_t id = 0;
  std::vector<bool> buttons;
  std::vector<float> axes;
  std::vector<int32_t> hats;
};

// Capture target plus the dirty flag HandleEvent sets and FlushJoystick-
// CaptureState clears, mirroring dirtyIds_/FlushDirtyState for gamepads but
// scoped to one id since only one joystick capture runs at a time.
// targetId is -1 when no capture is active.
struct JoystickCaptureState {
  int32_t targetId = -1;
  bool dirty = false;
};

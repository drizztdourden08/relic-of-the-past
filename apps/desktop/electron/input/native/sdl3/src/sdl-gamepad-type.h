/* @layer electron-main @kind native */
// Pure string mappings from SDL's own gamepad-family and button-label enums.
// Split out of sdl-thread.h/sdl-thread-lifecycle.cc so those stay under the
// line cap. No device-specific knowledge lives here: every value comes from
// SDL_GamepadType / SDL_GamepadButtonLabel, never a VID/PID list.
#pragma once

#include <SDL3/SDL.h>

#include <string>

// Lowercased, hyphenated family name for `type`, matching the app's
// SdlGamepadType union ('unknown', 'standard', 'xbox360', 'xboxone', 'ps3',
// 'ps4', 'ps5', 'switch-pro', 'joycon-left', 'joycon-right', 'joycon-pair',
// 'gamecube'). SDL_GAMEPAD_TYPE_UNKNOWN and any future value map to 'unknown'.
std::string SdlGamepadTypeString(SDL_GamepadType type);

// The face-button label this pad prints, matching SDL_GamepadButtonLabel:
// 'A', 'B', 'X', 'Y', 'CROSS', 'CIRCLE', 'SQUARE', 'TRIANGLE'. Returns an
// empty string for SDL_GAMEPAD_BUTTON_LABEL_UNKNOWN, meaning SDL does not
// know a label for that button on this pad.
std::string SdlGamepadButtonLabelString(SDL_GamepadButtonLabel label);

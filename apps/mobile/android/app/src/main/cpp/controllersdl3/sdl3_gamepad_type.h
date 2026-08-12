/*
 * String mappings for SDL_GamepadType/SDL_GamepadButtonLabel, kept in lockstep
 * with the desktop addon's src/sdl-gamepad-type.cc (apps/desktop/electron/input/
 * native/sdl3) so both platforms report the exact same strings for
 * ControllerAddedInfo.sdlType / .buttonLabels.
 */
#ifndef CONTROLLERSDL3_SDL3_GAMEPAD_TYPE_H_
#define CONTROLLERSDL3_SDL3_GAMEPAD_TYPE_H_

#include <SDL3/SDL_gamepad.h>

const char *Sdl3GamepadTypeString(SDL_GamepadType type);
const char *Sdl3GamepadButtonLabelString(SDL_GamepadButtonLabel label);

#endif  // CONTROLLERSDL3_SDL3_GAMEPAD_TYPE_H_

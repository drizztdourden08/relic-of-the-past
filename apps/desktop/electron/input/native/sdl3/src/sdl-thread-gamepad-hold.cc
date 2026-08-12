/* @layer electron-main @kind native */
// Explicit release/restore of the gamepad subsystem, split out of
// ApplyRescan (sdl-thread-commands.cc) so a caller can hold gamepads
// released for just the duration of a raw HID capture instead of running a
// full rescan. ApplyReleaseGamepads/ApplyRestoreGamepads run on the SDL
// thread from PumpCommands, same as every other Apply* in this addon.
#include "sdl-thread.h"

#include <utility>

// Closes every open gamepad+joystick through the normal disconnect path
// (CloseGamepad/CloseJoystick already do exactly the close + erase +
// emit-removed sequence a real removal does) and quits the gamepad
// subsystem, so a raw HID open on the same device can succeed afterward.
// The SDL thread itself and SDL_hid_* are untouched: only the gamepad
// backend's exclusive libusb claim is released. Idempotent: a no-op while
// already released, so a second call, or Stop() racing a held state, never
// double-quits the subsystem.
void SdlThread::ApplyReleaseGamepads() {
  if (gamepadsReleased_) {
    return;
  }

  std::vector<SDL_JoystickID> ids;
  ids.reserve(gamepads_.size());
  for (auto& [id, gamepad] : gamepads_) {
    (void)gamepad;
    ids.push_back(id);
  }
  for (SDL_JoystickID id : ids) {
    CloseGamepad(id);
  }

  std::vector<SDL_JoystickID> joystickIds;
  joystickIds.reserve(joysticks_.size());
  for (auto& [id, joystick] : joysticks_) {
    (void)joystick;
    joystickIds.push_back(id);
  }
  for (SDL_JoystickID id : joystickIds) {
    CloseJoystick(id);
  }

  SDL_QuitSubSystem(SDL_INIT_GAMEPAD);
  gamepadsReleased_ = true;
  EmitGamepadHold(true);
}

// Re-inits the gamepad subsystem and replays every mapping this addon has
// added: SDL_QuitSubSystem(SDL_INIT_GAMEPAD) also quits the joystick
// subsystem underneath it (nothing else holds a joystick refcount), which
// clears SDL's mapping table, so a restore with no replay would silently
// lose every custom mapping. SDL re-synthesizes SDL_EVENT_GAMEPAD_ADDED for
// everything it can reclaim, which HandleEvent picks up on the next loop
// iteration through OpenGamepad with no special casing here. Sufficient on
// its own: idempotent (a no-op while not currently released), so it never
// requires ApplyReleaseGamepads to have run first in the same call chain.
void SdlThread::ApplyRestoreGamepads() {
  if (!gamepadsReleased_) {
    return;
  }

  SDL_InitSubSystem(SDL_INIT_GAMEPAD);
  gamepadsReleased_ = false;

  // Quitting the gamepad subsystem drops SDL's mapping table, so it has to be
  // rebuilt here or every controller comes back unmapped.
  ApplyPendingMappings();

  EmitGamepadHold(false);
}

void SdlThread::EmitGamepadHold(bool held) {
  auto* event = new GamepadHoldEvent();
  event->held = held;

  napi_status status = tsfn_.NonBlockingCall(
      event, [](Napi::Env env, Napi::Function callback, GamepadHoldEvent* data) {
        Napi::Object object = Napi::Object::New(env);
        object.Set("type", "gamepad-hold");
        object.Set("held", data->held);
        callback.Call({object});
        delete data;
      });

  if (status != napi_ok) {
    delete event;
  }
}

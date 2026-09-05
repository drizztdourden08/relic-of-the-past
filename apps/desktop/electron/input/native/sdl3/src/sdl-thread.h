/* @layer electron-main @kind native */
// SDL3 gamepad lifecycle on one dedicated thread. Init, open/close, polling and
// rumble all happen inside Run(). Public methods called from the JS thread touch
// only a mutex-guarded command queue or cache, except calls SDL states as safe
// from any thread (mapping calls, EnumerateHid, MappingForGuid), which run inline.
#pragma once

#include <napi.h>

#include <SDL3/SDL.h>

#include <array>
#include <atomic>
#include <cstdint>
#include <deque>
#include <mutex>
#include <optional>
#include <string>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "sdl-joystick-types.h"
#include "sdl-raw-capture.h"

// One event for the JS callback. Plain data built on the SDL thread; the JS
// object is built later inside the ThreadSafeFunction callback in addon.cc.
struct GamepadEvent {
  enum class Kind { kAdded, kRemoved, kState, kError };

  Kind kind = Kind::kError;
  int32_t id = 0;
  std::string name;
  int32_t vendorId = 0;
  int32_t productId = 0;
  std::string guid;
  bool hasRumble = false;
  bool hasGyro = false;
  // 'wired'/'wireless' from SDL_GetJoystickConnectionState; 'unknown' when SDL
  // can't tell. Bus-agnostic: never a USB-vs-Bluetooth answer (SDL does not
  // report bus type for an XInput-backed pad).
  std::string connectionState = "unknown";
  // Positional by SDL_GamepadButton index; SDL_GamepadHasButton is not consulted.
  std::array<bool, SDL_GAMEPAD_BUTTON_COUNT> buttons{};
  // [LEFTX, LEFTY, RIGHTX, RIGHTY, LEFT_TRIGGER, RIGHT_TRIGGER].
  std::array<float, 6> axes{};
  // SDL's own family for this device, from SDL_GetGamepadType. See
  // sdl-gamepad-type.h for the string mapping.
  std::string sdlType = "unknown";
  // Whether the device actually has each control, from SDL_GamepadHasButton.
  // Positional like `buttons`, but this is presence, not live state.
  std::array<bool, SDL_GAMEPAD_BUTTON_COUNT> hasButton{};
  // Whether the device actually has each axis, from SDL_GamepadHasAxis.
  // Positional like `axes`.
  std::array<bool, SDL_GAMEPAD_AXIS_COUNT> hasAxis{};
  // The label this pad prints for each button index, from
  // SDL_GetGamepadButtonLabel. Positional like `hasButton`; empty when SDL
  // does not know a label for that button on this pad.
  std::array<std::string, SDL_GAMEPAD_BUTTON_COUNT> buttonLabels{};
  std::string message;
};

// A request queued from the JS thread for the SDL thread's next tick. `kind`
// picks the meaningful fields: rumble uses gamepadId/lowFrequency/highFrequency/
// durationMs, kHidCaptureOpen uses hidVendorId/hidProductId, kJoystickCaptureStart
// uses joystickId, the rest use none. All fire-and-forget except kHidCaptureOpen,
// whose caller blocks on rawCapture_'s condition variable (see StartRawCapture).
struct SdlCommand {
  enum class Kind {
    kRumble,
    kRescan,
    kHidCaptureOpen,
    kHidCaptureClose,
    kJoystickCaptureStart,
    kJoystickCaptureStop,
    kReleaseGamepads,
    kRestoreGamepads
  };

  Kind kind = Kind::kRumble;
  int32_t gamepadId = 0;
  float lowFrequency = 0.0f;
  float highFrequency = 0.0f;
  uint32_t durationMs = 0;
  int32_t hidVendorId = 0;
  int32_t hidProductId = 0;
  int32_t joystickId = 0;
};

// One HID device from SDL_hid_enumerate, filtered to the generic desktop page's
// joystick/gamepad/multi-axis usages (see SdlThread::EnumerateHid). Reported
// whether or not SDL could claim it, so "held by another app" is tellable
// apart from "not plugged in".
struct HidDeviceInfo {
  int32_t vendorId = 0;
  int32_t productId = 0;
  std::string productString;
  std::string manufacturerString;
  std::string path;
  std::string busType;
};

// Emitted after ApplyReleaseGamepads/ApplyRestoreGamepads finish, so the
// renderer can show whether the gamepad subsystem is currently held open
// for a raw HID capture.
struct GamepadHoldEvent {
  bool held = false;
};

class SdlThread {
 public:
  SdlThread() = default;
  ~SdlThread();

  // Spawns the SDL thread. Safe to call once per instance; a second call
  // while already running is a no-op.
  void Start(Napi::ThreadSafeFunction tsfn);

  // Signals shutdown and joins the SDL thread. SDL_Quit runs on that
  // thread, never here.
  void Stop();

  // Queues a rumble request; returns false without queueing anything if
  // the SDL thread isn't running to drain it.
  bool QueueRumble(int32_t gamepadId, float low, float high, uint32_t durationMs);

  // Runs SDL_AddGamepadMapping inline (SDL: safe from any thread). Queueing it
  // would block the JS thread on a promise the SDL thread may never fulfil if
  // shutdown races. False when SDL isn't initialized or the mapping is rejected.
  bool AddMapping(const std::string& mapping);

  // Inline like AddMapping. Returns the count added, or -1 when SDL isn't
  // initialized or the file could not be read.
  int32_t AddMappingsFromFile(const std::string& path);

  // Runs SDL_hid_enumerate inline (must return synchronously; same shutdown
  // hazard as AddMapping). SDL_hid_init() runs once at SDL thread start (Run())
  // so this is safe alongside the gamepad backend's own hidapi work. Filtered
  // by HID usage-page/usage only, never a VID/PID list.
  std::vector<HidDeviceInfo> EnumerateHid();

  // Queues a subsystem rescan; false if the SDL thread isn't running.
  // Fire-and-forget: the removed/added events are the observable result.
  bool QueueRescan();

  // Queues closing every open gamepad+joystick and quitting the gamepad
  // subsystem so a raw HID open on the same device can succeed. The SDL thread
  // and SDL_hid_* stay alive. False if the SDL thread isn't running.
  // Fire-and-forget: watch for `removed` events and `gamepad-hold` held=true.
  bool QueueReleaseGamepads();

  // Queues restoring the gamepad subsystem and replaying every added mapping.
  // Does not require QueueReleaseGamepads first. False if the SDL thread isn't
  // running. Fire-and-forget: `added` events and `gamepad-hold` held=false follow.
  bool QueueRestoreGamepads();

  // Queues a raw HID open (never inline) and blocks the JS thread on a bounded
  // wait so a caller can never hang forever; the ~16ms tick means a normal open
  // resolves almost instantly. One capture at a time: a second call closes the first.
  RawCaptureResult StartRawCapture(int32_t vendorId, int32_t productId);

  // Queues closing the raw HID capture, if any. Fire-and-forget.
  void StopRawCapture();

  // Queues switching the joystick-level capture to `joystickId`. False if the
  // SDL thread isn't running. Fire-and-forget: `joystick` events follow.
  bool StartJoystickCapture(int32_t joystickId);

  // Queues clearing the joystick-level capture, if any.
  void StopJoystickCapture();

  // Every joystick SDL has open, gamepad-mapped or not. Reads a mutex-guarded
  // cache, so it never blocks on the command queue.
  std::vector<JoystickInfo> ListJoysticks();

  // Runs SDL_GetGamepadMappingForGUID inline, same reasoning as AddMapping.
  // std::nullopt when SDL isn't initialized or no mapping exists for this GUID.
  std::optional<std::string> MappingForGuid(const std::string& guid);

 private:
  void Run();
  void PumpCommands();
  void ApplyRumble(const SdlCommand& command);
  void ApplyRescan();
  // Split out of ApplyRescan so a raw HID capture can hold gamepads released.
  // Both are idempotent, so Stop() racing either never double-quits/double-inits.
  void ApplyReleaseGamepads();
  void ApplyRestoreGamepads();
  // Applies every recorded mapping and returns how many took. Run after SDL_Init
  // and again after a subsystem restore, which clears SDL's mapping table.
  int32_t ApplyPendingMappings();
  void EmitGamepadHold(bool held);
  void HandleEvent(const SDL_Event& event);
  void OpenGamepad(SDL_JoystickID id);
  void CloseGamepad(SDL_JoystickID id);
  void FlushDirtyState();
  void Emit(GamepadEvent* event);
  void EmitError(const std::string& message);

  // Raw HID capture: applied on the SDL thread from PumpCommands, polled
  // once per Run() tick, emitted through their own tsfn_ call site.
  void ApplyHidCaptureOpen(const SdlCommand& command);
  void ApplyHidCaptureClose();
  void PollRawCapture();
  void EmitRaw(RawHidEvent* event);

  // Joystick tracking: every open joystick, gamepad-mapped or not.
  void OpenJoystick(SDL_JoystickID id);
  void CloseJoystick(SDL_JoystickID id);
  void RebuildJoysticksSnapshot();

  // Joystick-level capture: applied on the SDL thread from PumpCommands,
  // flushed on SDL_EVENT_JOYSTICK_UPDATE_COMPLETE like FlushDirtyState.
  void ApplyJoystickCaptureStart(const SdlCommand& command);
  void ApplyJoystickCaptureStop();
  void FlushJoystickCaptureState();
  // Emits a JoystickStateEvent for `id` unconditionally. ApplyJoystickCaptureStart
  // uses it for an initial sample (an idle device may never send a dirty
  // JOYSTICK_UPDATE_COMPLETE); FlushJoystickCaptureState is dirty-gated.
  void EmitCurrentJoystickState(int32_t id);
  void EmitJoystickState(JoystickStateEvent* event);

  std::thread thread_;
  std::atomic<bool> shuttingDown_{false};
  std::atomic<bool> running_{false};
  Napi::ThreadSafeFunction tsfn_;

  std::mutex commandMutex_;
  std::deque<SdlCommand> commands_;

  // Every mapping added so far, so ApplyRescan can replay them: quitting the
  // gamepad subsystem clears SDL's mapping table. Written from the JS thread,
  // read from the SDL thread; own mutex since it is unrelated to the queue.
  std::mutex mappingsMutex_;
  std::vector<std::string> mappingStrings_;
  std::vector<std::string> mappingFiles_;

  std::unordered_map<SDL_JoystickID, SDL_Gamepad*> gamepads_;
  std::unordered_set<SDL_JoystickID> dirtyIds_;

  // Guards ApplyReleaseGamepads/ApplyRestoreGamepads idempotency. SDL-thread-confined.
  bool gamepadsReleased_ = false;

  RawCaptureState rawCapture_;

  // joysticks_ is SDL-thread-confined. joysticksSnapshot_ is the cross-thread
  // mirror ListJoysticks() reads, under its own mutex (written by the SDL
  // thread, read by the JS thread).
  std::unordered_map<SDL_JoystickID, SDL_Joystick*> joysticks_;
  std::mutex joysticksSnapshotMutex_;
  std::vector<JoystickInfo> joysticksSnapshot_;

  JoystickCaptureState joystickCapture_;
};

// Loads libusb from beside this addon so SDL's later by-name request resolves.
// Call before SDL initializes; see libusb-preload.cc. False if it could not be
// loaded, which costs only the devices that require it.
bool PreloadLibusb();

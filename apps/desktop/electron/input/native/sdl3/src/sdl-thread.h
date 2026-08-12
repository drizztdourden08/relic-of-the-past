/* @layer electron-main @kind native */
// SDL3 gamepad lifecycle owned by a single dedicated thread. This class
// knows nothing about any specific controller: it only forwards SDL3 calls
// and packages the plain data SDL already reports (buttons, axes, ids,
// strings) for the JS side to interpret. Init, device open/close, polling,
// and rumble all happen inside Run(), which executes exclusively on the
// thread this class spawns. Every public method callable from the JS
// thread touches only a mutex-guarded command queue or a mutex-guarded
// cross-thread cache, with one class of documented exception: calls SDL
// states as safe from any thread (the mapping calls, EnumerateHid,
// MappingForGuid) run inline rather than round-tripping through the queue.
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

// A single event bound for the JS callback. Built entirely from plain data
// on the SDL thread; the matching JS object is constructed later, on the
// JS thread, inside the ThreadSafeFunction callback in addon.cc.
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
  // 'wired'/'wireless' straight from SDL_GetJoystickConnectionState; 'unknown'
  // when SDL can't tell (SDL_JOYSTICK_CONNECTION_UNKNOWN/INVALID). This is a
  // bus-agnostic wired/wireless read, never a USB-vs-Bluetooth answer. SDL
  // does not report bus type for an XInput-backed pad.
  std::string connectionState = "unknown";
  // Fixed-length, positional. Every SDL_GamepadButton index is emitted so
  // the JS side can index by the same enum SDL uses; SDL_GamepadHasButton
  // is not consulted here.
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

// A request queued from the JS thread for the SDL thread to execute on its
// next tick. `kind` picks which fields are meaningful: rumble uses
// gamepadId/lowFrequency/highFrequency/durationMs, rescan/releaseGamepads/
// restoreGamepads use none of them, kHidCaptureOpen uses hidVendorId/
// hidProductId, kJoystickCaptureStart uses joystickId. Most of these are
// fire-and-forget, and nothing waits on the result, except kHidCaptureOpen,
// whose caller blocks on rawCapture_'s condition variable for the
// RawCaptureResult (see StartRawCapture).
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

// One HID device reported by SDL_hid_enumerate, already filtered to the
// generic desktop usage page's joystick/gamepad/multi-axis usages (HID spec
// constants — see SdlThread::EnumerateHid). Reported whether or not SDL
// could claim the device as a gamepad, so the caller can tell "connected but
// held by another application" apart from "not plugged in".
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

  // Runs SDL_AddGamepadMapping inline on the calling thread. SDL documents
  // this as safe from any thread; queueing it instead would block the JS
  // thread on a promise the SDL thread may never fulfil if shutdown races.
  // Returns false when SDL isn't initialized or the mapping is rejected.
  bool AddMapping(const std::string& mapping);

  // Runs SDL_AddGamepadMappingsFromFile inline, same reasoning as above.
  // Returns the number of mappings added, or -1 when SDL isn't initialized
  // or the file could not be read.
  int32_t AddMappingsFromFile(const std::string& path);

  // Runs SDL_hid_enumerate inline on the calling thread rather than through
  // the command queue: this call must return synchronously, and queueing it
  // would mean blocking the JS thread on a promise the SDL thread might
  // never fulfil if shutdown races (the same hazard AddMapping documents).
  // SDL_hid_init() is called once when the SDL thread starts (see Run())
  // specifically so this is safe to run concurrently with whatever hidapi
  // work the SDL thread's own gamepad backend is doing — see the
  // SDL_hid_init doc comment on why that matters with concurrent threads.
  // Filtered to HID spec usage-page/usage constants only, never a
  // VID/PID list — reported whether or not SDL could claim the device.
  std::vector<HidDeviceInfo> EnumerateHid();

  // Queues a subsystem rescan; returns false without queueing anything if
  // the SDL thread isn't running to drain it. Fire-and-forget: the
  // removed/added events it produces are the observable result.
  bool QueueRescan();

  // Queues closing every open gamepad+joystick and quitting the gamepad
  // subsystem, so a raw HID open on the same device can succeed afterward.
  // The SDL thread and SDL_hid_* stay alive; only the gamepad backend's
  // exclusive claim is released. Returns false without queueing anything
  // if the SDL thread isn't running. Fire-and-forget: watch for `removed`
  // events and a `gamepad-hold` event with held=true.
  bool QueueReleaseGamepads();

  // Queues restoring the gamepad subsystem after QueueReleaseGamepads and
  // replaying every mapping this addon has added. Sufficient on its own:
  // it does not require QueueReleaseGamepads to have run first. Returns
  // false without queueing anything if the SDL thread isn't running.
  // Fire-and-forget: SDL re-synthesizes `added` events for whatever it can
  // reclaim, and a `gamepad-hold` event with held=false follows.
  bool QueueRestoreGamepads();

  // Queues a raw HID open on the SDL thread through the command queue
  // (never opened inline) and blocks the calling JS thread on a bounded
  // wait for the outcome. Bounded rather than indefinite so a caller can
  // never hang forever if something upstream goes wrong; the SDL thread's
  // ~16ms tick means a normal open resolves almost instantly. Only one
  // capture runs at a time, so a second call closes whatever was open first.
  RawCaptureResult StartRawCapture(int32_t vendorId, int32_t productId);

  // Queues closing the raw HID capture, if any. Fire-and-forget like
  // QueueRescan: nothing about closing needs to reach back to the caller.
  void StopRawCapture();

  // Queues switching the joystick-level capture to `joystickId`. Returns
  // false without queueing anything if the SDL thread isn't running.
  // Fire-and-forget: the `joystick` events it produces are the observable
  // result, same reasoning as QueueRescan.
  bool StartJoystickCapture(int32_t joystickId);

  // Queues clearing the joystick-level capture, if any.
  void StopJoystickCapture();

  // Snapshot of every joystick SDL currently has open, whether or not it
  // also has a gamepad mapping. Reads a mutex-guarded cache the SDL thread
  // keeps current, so this never blocks on the command queue.
  std::vector<JoystickInfo> ListJoysticks();

  // Runs SDL_GetGamepadMappingForGUID inline, same reasoning as AddMapping:
  // SDL documents it as safe from any thread, and queueing it would risk a
  // hang instead of a slow call. Returns std::nullopt when SDL isn't
  // initialized or no mapping exists for this GUID.
  std::optional<std::string> MappingForGuid(const std::string& guid);

 private:
  void Run();
  void PumpCommands();
  void ApplyRumble(const SdlCommand& command);
  void ApplyRescan();
  // Split out of ApplyRescan so a caller can hold gamepads released for
  // just a raw HID capture instead of a full rescan. Both are idempotent:
  // ApplyReleaseGamepads is a no-op while already released, and
  // ApplyRestoreGamepads is a no-op while not released, so Stop() racing
  // either one never double-quits or double-inits the subsystem.
  void ApplyReleaseGamepads();
  void ApplyRestoreGamepads();
  // Applies every mapping recorded so far and returns how many took. Run once
  // after SDL_Init, so mappings requested before the thread was up still land,
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
  // Builds a JoystickStateEvent for `id` from joysticks_ and emits it
  // unconditionally. Shared by ApplyJoystickCaptureStart, which emits an
  // initial sample synchronously rather than waiting for the next dirty
  // JOYSTICK_UPDATE_COMPLETE (a genuinely idle device may never send one),
  // and FlushJoystickCaptureState, which is dirty-gated.
  void EmitCurrentJoystickState(int32_t id);
  void EmitJoystickState(JoystickStateEvent* event);

  std::thread thread_;
  std::atomic<bool> shuttingDown_{false};
  std::atomic<bool> running_{false};
  Napi::ThreadSafeFunction tsfn_;

  std::mutex commandMutex_;
  std::deque<SdlCommand> commands_;

  // Mirrors every mapping successfully added through AddMapping/
  // AddMappingsFromFile, purely so ApplyRescan can replay them: tearing the
  // gamepad subsystem down for a rescan also drops SDL's own mapping table
  // (SDL_QuitSubSystem(SDL_INIT_GAMEPAD) quits the joystick subsystem
  // underneath it, which clears mappings). Written from the JS thread
  // inside AddMapping/AddMappingsFromFile, read from the SDL thread inside
  // ApplyRescan — guarded by mappingsMutex_ rather than commandMutex_ since
  // it is unrelated data.
  std::mutex mappingsMutex_;
  std::vector<std::string> mappingStrings_;
  std::vector<std::string> mappingFiles_;

  std::unordered_map<SDL_JoystickID, SDL_Gamepad*> gamepads_;
  std::unordered_set<SDL_JoystickID> dirtyIds_;

  // Guards ApplyReleaseGamepads/ApplyRestoreGamepads idempotency. SDL-
  // thread-confined, same as gamepads_ above: only ever read or written
  // from inside Run()'s own call chain.
  bool gamepadsReleased_ = false;

  RawCaptureState rawCapture_;

  // joysticks_ is SDL-thread-confined, same as gamepads_. joysticksSnapshot_
  // is the cross-thread mirror ListJoysticks() reads, guarded by its own
  // mutex rather than commandMutex_ since it is unrelated data, the same
  // reasoning mappingsMutex_ already documents above, just in the other
  // direction (written by the SDL thread, read by the JS thread).
  std::unordered_map<SDL_JoystickID, SDL_Joystick*> joysticks_;
  std::mutex joysticksSnapshotMutex_;
  std::vector<JoystickInfo> joysticksSnapshot_;

  JoystickCaptureState joystickCapture_;
};

// Loads libusb from beside this addon so SDL's later by-name request resolves.
// Must be called before SDL initializes. See libusb-preload.cc for why the OS
// search path does not find it on its own. Returns false if it could not be
// loaded, which costs only the devices that require it.
bool PreloadLibusb();

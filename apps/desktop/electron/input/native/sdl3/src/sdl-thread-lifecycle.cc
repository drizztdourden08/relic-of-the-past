/* @layer electron-main @kind native */
// SdlThread lifecycle: Start/Stop/Run and the event loop Run() drives. Everything
// here runs on the thread spawned by Start(), except Start/Stop themselves, which
// only touch the thread handle and the shutdown flag from the JS thread.
#include "sdl-thread.h"

#include <algorithm>
#include <chrono>
#include <thread>

#include "sdl-gamepad-type.h"

namespace {

constexpr int kWaitTimeoutMs = 16;

// Longest Start() blocks waiting for SDL init, in kStartupWaitStepMs steps.
// Generous: normally a few ms, and the alternative is a half-initialised subsystem.
constexpr int kStartupWaitSteps = 400, kStartupWaitStepMs = 5;

float NormalizeStick(Sint16 raw) {
  return raw < 0 ? static_cast<float>(raw) / 32768.0f : static_cast<float>(raw) / 32767.0f;
}

float NormalizeTrigger(Sint16 raw) {
  return std::max(0.0f, static_cast<float>(raw) / 32767.0f);
}

void ReadButtonsAndAxes(SDL_Gamepad* gamepad, GamepadEvent* event) {
  for (int i = 0; i < SDL_GAMEPAD_BUTTON_COUNT; ++i) {
    event->buttons[i] = SDL_GetGamepadButton(gamepad, static_cast<SDL_GamepadButton>(i));
  }

  event->axes[0] = NormalizeStick(SDL_GetGamepadAxis(gamepad, SDL_GAMEPAD_AXIS_LEFTX));
  event->axes[1] = NormalizeStick(SDL_GetGamepadAxis(gamepad, SDL_GAMEPAD_AXIS_LEFTY));
  event->axes[2] = NormalizeStick(SDL_GetGamepadAxis(gamepad, SDL_GAMEPAD_AXIS_RIGHTX));
  event->axes[3] = NormalizeStick(SDL_GetGamepadAxis(gamepad, SDL_GAMEPAD_AXIS_RIGHTY));
  event->axes[4] = NormalizeTrigger(SDL_GetGamepadAxis(gamepad, SDL_GAMEPAD_AXIS_LEFT_TRIGGER));
  event->axes[5] = NormalizeTrigger(SDL_GetGamepadAxis(gamepad, SDL_GAMEPAD_AXIS_RIGHT_TRIGGER));
}

}  // namespace

SdlThread::~SdlThread() { Stop(); }

void SdlThread::Start(Napi::ThreadSafeFunction tsfn) {
  if (thread_.joinable()) {
    return;
  }
  tsfn_ = tsfn;
  shuttingDown_.store(false, std::memory_order_relaxed);
  thread_ = std::thread(&SdlThread::Run, this);

  // Return only once SDL_Init and SDL_hid_init are done. EnumerateHid() reaches
  // hidapi from the calling thread and would otherwise race this init; losing
  // means the gamepad backend claims nothing through HIDAPI (no rumble, gyro or
  // input). Bounded, so a failed SDL_Init still returns.
  for (int i = 0; i < kStartupWaitSteps && !running_.load(std::memory_order_acquire); ++i) {
    std::this_thread::sleep_for(std::chrono::milliseconds(kStartupWaitStepMs));
  }
}

void SdlThread::Stop() {
  if (!thread_.joinable()) {
    return;
  }
  shuttingDown_.store(true, std::memory_order_relaxed);
  thread_.join();
}

void SdlThread::Run() {
  SDL_SetHint(SDL_HINT_JOYSTICK_THREAD, "1");

  // Before SDL touches its joystick backends, or every device needing a
  // bulk-endpoint handshake is dropped and looks held by another application.
  if (!PreloadLibusb()) {
    EmitError("libusb could not be loaded from beside the addon; controllers "
              "that require it will not be detected");
  }

  if (!SDL_Init(SDL_INIT_GAMEPAD | SDL_INIT_SENSOR)) {
    EmitError(std::string("SDL_Init failed: ") + SDL_GetError());
    tsfn_.Release();
    return;
  }
  // SDL_hid_enumerate() lazily inits on its own, but SDL's doc on SDL_hid_init
  // calls for this when hidapi is touched from more than one thread, which
  // EnumerateHid() on the JS thread does.
  SDL_hid_init();
  running_.store(true, std::memory_order_release);

  // Mappings requested before this thread was up were recorded, not applied.
  // Apply before any device is opened so controllers are mapped on first sight.
  // Only SDL knows what it accepted, so the real total is logged here (plain
  // SDL_Log: a startup fact, not an error for EmitError).
  int32_t appliedMappings = ApplyPendingMappings();
  SDL_Log("applied %d gamepad mapping(s)", appliedMappings);

  SDL_Event event;
  while (!shuttingDown_.load(std::memory_order_relaxed)) {
    // Cheap when idle, and gives shutdown + queued commands a ~60Hz check
    // even if no controller ever sends an event.
    if (SDL_WaitEventTimeout(&event, kWaitTimeoutMs)) {
      HandleEvent(event);
    }
    PumpCommands();
    // Non-blocking (0ms), so a raw capture in progress never delays this
    // loop's ~16ms cadence.
    PollRawCapture();
  }
  // Drain anything queued in the instant before shuttingDown_ was observed
  // so a blocked AddMapping/AddMappingsFromFile caller isn't left hanging.
  PumpCommands();

  running_.store(false, std::memory_order_release);
  ApplyHidCaptureClose();
  for (auto& [id, gamepad] : gamepads_) {
    (void)id;
    SDL_CloseGamepad(gamepad);
  }
  gamepads_.clear();
  for (auto& [id, joystick] : joysticks_) {
    (void)id;
    SDL_CloseJoystick(joystick);
  }
  joysticks_.clear();

  SDL_hid_exit();
  SDL_Quit();
  tsfn_.Release();
}

void SdlThread::HandleEvent(const SDL_Event& event) {
  switch (event.type) {
    case SDL_EVENT_GAMEPAD_ADDED:
      OpenGamepad(event.gdevice.which);
      break;
    case SDL_EVENT_GAMEPAD_REMOVED:
      CloseGamepad(event.gdevice.which);
      break;
    case SDL_EVENT_GAMEPAD_AXIS_MOTION:
      dirtyIds_.insert(event.gaxis.which);
      break;
    case SDL_EVENT_GAMEPAD_BUTTON_DOWN:
    case SDL_EVENT_GAMEPAD_BUTTON_UP:
      dirtyIds_.insert(event.gbutton.which);
      break;
    case SDL_EVENT_GAMEPAD_UPDATE_COMPLETE:
      FlushDirtyState();
      break;
    case SDL_EVENT_JOYSTICK_ADDED:
      OpenJoystick(event.jdevice.which);
      break;
    case SDL_EVENT_JOYSTICK_REMOVED:
      CloseJoystick(event.jdevice.which);
      break;
    case SDL_EVENT_JOYSTICK_AXIS_MOTION:
      if (joystickCapture_.targetId == static_cast<int32_t>(event.jaxis.which)) {
        joystickCapture_.dirty = true;
      }
      break;
    case SDL_EVENT_JOYSTICK_BUTTON_DOWN:
    case SDL_EVENT_JOYSTICK_BUTTON_UP:
      if (joystickCapture_.targetId == static_cast<int32_t>(event.jbutton.which)) {
        joystickCapture_.dirty = true;
      }
      break;
    case SDL_EVENT_JOYSTICK_HAT_MOTION:
      if (joystickCapture_.targetId == static_cast<int32_t>(event.jhat.which)) {
        joystickCapture_.dirty = true;
      }
      break;
    case SDL_EVENT_JOYSTICK_UPDATE_COMPLETE:
      FlushJoystickCaptureState();
      break;
    default:
      break;
  }
}

void SdlThread::OpenGamepad(SDL_JoystickID id) {
  SDL_Gamepad* gamepad = SDL_OpenGamepad(id);
  if (gamepad == nullptr) {
    EmitError(std::string("SDL_OpenGamepad failed: ") + SDL_GetError());
    return;
  }
  gamepads_[id] = gamepad;

  auto* added = new GamepadEvent();
  added->kind = GamepadEvent::Kind::kAdded;
  added->id = static_cast<int32_t>(id);

  const char* name = SDL_GetGamepadName(gamepad);
  added->name = name != nullptr ? name : "";
  added->vendorId = SDL_GetGamepadVendor(gamepad);
  added->productId = SDL_GetGamepadProduct(gamepad);

  SDL_GUID guid = SDL_GetGamepadGUIDForID(id);
  char guidBuffer[33] = {};
  SDL_GUIDToString(guid, guidBuffer, sizeof(guidBuffer));
  added->guid = guidBuffer;

  SDL_PropertiesID props = SDL_GetGamepadProperties(gamepad);
  added->hasRumble = SDL_GetBooleanProperty(props, SDL_PROP_GAMEPAD_CAP_RUMBLE_BOOLEAN, false);
  added->hasGyro = SDL_GamepadHasSensor(gamepad, SDL_SENSOR_GYRO);

  switch (SDL_GetJoystickConnectionState(SDL_GetGamepadJoystick(gamepad))) {
    case SDL_JOYSTICK_CONNECTION_WIRED:
      added->connectionState = "wired";
      break;
    case SDL_JOYSTICK_CONNECTION_WIRELESS:
      added->connectionState = "wireless";
      break;
    default:
      added->connectionState = "unknown";
      break;
  }

  added->sdlType = SdlGamepadTypeString(SDL_GetGamepadType(gamepad));
  for (int i = 0; i < SDL_GAMEPAD_BUTTON_COUNT; ++i) {
    auto button = static_cast<SDL_GamepadButton>(i);
    added->hasButton[i] = SDL_GamepadHasButton(gamepad, button);
    added->buttonLabels[i] = SdlGamepadButtonLabelString(SDL_GetGamepadButtonLabel(gamepad, button));
  }
  for (int i = 0; i < SDL_GAMEPAD_AXIS_COUNT; ++i) {
    added->hasAxis[i] = SDL_GamepadHasAxis(gamepad, static_cast<SDL_GamepadAxis>(i));
  }

  Emit(added);
}

void SdlThread::CloseGamepad(SDL_JoystickID id) {
  auto it = gamepads_.find(id);
  if (it == gamepads_.end()) {
    return;
  }
  SDL_CloseGamepad(it->second);
  gamepads_.erase(it);
  dirtyIds_.erase(id);

  auto* removed = new GamepadEvent();
  removed->kind = GamepadEvent::Kind::kRemoved;
  removed->id = static_cast<int32_t>(id);
  Emit(removed);
}

void SdlThread::FlushDirtyState() {
  if (dirtyIds_.empty()) {
    return;
  }
  for (SDL_JoystickID id : dirtyIds_) {
    auto it = gamepads_.find(id);
    if (it == gamepads_.end()) {
      continue;
    }

    auto* state = new GamepadEvent();
    state->kind = GamepadEvent::Kind::kState;
    state->id = static_cast<int32_t>(id);
    ReadButtonsAndAxes(it->second, state);
    Emit(state);
  }
  dirtyIds_.clear();
}

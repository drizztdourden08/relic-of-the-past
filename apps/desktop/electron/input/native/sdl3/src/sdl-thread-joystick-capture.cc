/* @layer electron-main @kind native */
// Joystick-level capture: Start/StopJoystickCapture queue a command the
// same fire-and-forget way QueueRescan does, ApplyJoystickCaptureStart/Stop
// apply it on the SDL thread, and FlushJoystickCaptureState emits a sample
// on SDL_EVENT_JOYSTICK_UPDATE_COMPLETE, mirroring dirtyIds_/
// FlushDirtyState for gamepads, but scoped to the single active target so
// a capture never floods events for every joystick, moving or not.
#include "sdl-thread.h"

#include <utility>

namespace {

// Matches NormalizeStick in sdl-thread-lifecycle.cc: SDL's signed axis
// range is asymmetric (-32768..32767), so the negative and positive sides
// divide by different magnitudes to reach a clean -1..1 float.
float NormalizeJoystickAxis(Sint16 raw) {
  return raw < 0 ? static_cast<float>(raw) / 32768.0f : static_cast<float>(raw) / 32767.0f;
}

}  // namespace

bool SdlThread::StartJoystickCapture(int32_t joystickId) {
  if (!running_.load(std::memory_order_acquire)) {
    return false;
  }
  SdlCommand command;
  command.kind = SdlCommand::Kind::kJoystickCaptureStart;
  command.joystickId = joystickId;
  std::lock_guard<std::mutex> lock(commandMutex_);
  commands_.push_back(std::move(command));
  return true;
}

void SdlThread::StopJoystickCapture() {
  if (!running_.load(std::memory_order_acquire)) {
    return;
  }
  SdlCommand command;
  command.kind = SdlCommand::Kind::kJoystickCaptureStop;
  std::lock_guard<std::mutex> lock(commandMutex_);
  commands_.push_back(std::move(command));
}

void SdlThread::ApplyJoystickCaptureStart(const SdlCommand& command) {
  joystickCapture_.targetId = command.joystickId;
  joystickCapture_.dirty = false;
  // A genuinely idle device may never send a JOYSTICK_UPDATE_COMPLETE at
  // all (that event batches real axis/button/hat activity, so nothing
  // moving means nothing to batch), and waiting on one for the first
  // sample would mean the caller could see no data at all despite a
  // successful capture start. Building and emitting one sample right
  // here, off the command queue rather than the event loop, sidesteps that.
  EmitCurrentJoystickState(joystickCapture_.targetId);
}

void SdlThread::ApplyJoystickCaptureStop() {
  joystickCapture_.targetId = -1;
  joystickCapture_.dirty = false;
}

void SdlThread::FlushJoystickCaptureState() {
  if (!joystickCapture_.dirty || joystickCapture_.targetId < 0) {
    return;
  }
  joystickCapture_.dirty = false;
  EmitCurrentJoystickState(joystickCapture_.targetId);
}

void SdlThread::EmitCurrentJoystickState(int32_t id) {
  auto it = joysticks_.find(static_cast<SDL_JoystickID>(id));
  if (it == joysticks_.end()) {
    return;
  }

  SDL_Joystick* joystick = it->second;
  auto* state = new JoystickStateEvent();
  state->id = id;

  const int numButtons = SDL_GetNumJoystickButtons(joystick);
  state->buttons.resize(numButtons);
  for (int i = 0; i < numButtons; ++i) {
    state->buttons[i] = SDL_GetJoystickButton(joystick, i);
  }

  const int numAxes = SDL_GetNumJoystickAxes(joystick);
  state->axes.resize(numAxes);
  for (int i = 0; i < numAxes; ++i) {
    state->axes[i] = NormalizeJoystickAxis(SDL_GetJoystickAxis(joystick, i));
  }

  const int numHats = SDL_GetNumJoystickHats(joystick);
  state->hats.resize(numHats);
  for (int i = 0; i < numHats; ++i) {
    state->hats[i] = SDL_GetJoystickHat(joystick, i);
  }

  EmitJoystickState(state);
}

void SdlThread::EmitJoystickState(JoystickStateEvent* event) {
  napi_status status = tsfn_.NonBlockingCall(
      event, [](Napi::Env env, Napi::Function callback, JoystickStateEvent* data) {
        Napi::Object object = Napi::Object::New(env);
        object.Set("type", "joystick");
        object.Set("id", data->id);

        Napi::Array buttons = Napi::Array::New(env, data->buttons.size());
        for (size_t i = 0; i < data->buttons.size(); ++i) {
          buttons.Set(i, static_cast<bool>(data->buttons[i]));
        }
        object.Set("buttons", buttons);

        Napi::Array axes = Napi::Array::New(env, data->axes.size());
        for (size_t i = 0; i < data->axes.size(); ++i) {
          axes.Set(i, data->axes[i]);
        }
        object.Set("axes", axes);

        Napi::Array hats = Napi::Array::New(env, data->hats.size());
        for (size_t i = 0; i < data->hats.size(); ++i) {
          hats.Set(i, data->hats[i]);
        }
        object.Set("hats", hats);

        callback.Call({object});
        delete data;
      });

  if (status != napi_ok) {
    delete event;
  }
}

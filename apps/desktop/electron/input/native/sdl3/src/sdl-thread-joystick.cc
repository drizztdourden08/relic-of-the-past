/* @layer electron-main @kind native */
// Joystick-level device tracking, independent of SDL's own gamepad backend:
// OpenJoystick/CloseJoystick (called from HandleEvent on
// SDL_EVENT_JOYSTICK_ADDED/REMOVED, mirroring OpenGamepad/CloseGamepad),
// the mutex-guarded snapshot ListJoysticks() reads, and MappingForGuid. A
// joystick with no gamepad mapping is opened and tracked exactly the same
// as one that has one. This is what makes a controller visible to a
// mapping generator at all, unlike the gamepad-only path.
#include "sdl-thread.h"

#include <utility>

void SdlThread::OpenJoystick(SDL_JoystickID id) {
  SDL_Joystick* joystick = SDL_OpenJoystick(id);
  if (joystick == nullptr) {
    EmitError(std::string("SDL_OpenJoystick failed: ") + SDL_GetError());
    return;
  }
  joysticks_[id] = joystick;
  RebuildJoysticksSnapshot();
}

void SdlThread::CloseJoystick(SDL_JoystickID id) {
  auto it = joysticks_.find(id);
  if (it == joysticks_.end()) {
    return;
  }
  SDL_CloseJoystick(it->second);
  joysticks_.erase(it);

  if (joystickCapture_.targetId == static_cast<int32_t>(id)) {
    ApplyJoystickCaptureStop();
  }
  RebuildJoysticksSnapshot();
}

void SdlThread::RebuildJoysticksSnapshot() {
  std::vector<JoystickInfo> snapshot;
  snapshot.reserve(joysticks_.size());

  for (auto& [id, joystick] : joysticks_) {
    JoystickInfo info;
    info.id = static_cast<int32_t>(id);

    const char* name = SDL_GetJoystickName(joystick);
    info.name = name != nullptr ? name : "";

    SDL_GUID guid = SDL_GetJoystickGUID(joystick);
    char guidBuffer[33] = {};
    SDL_GUIDToString(guid, guidBuffer, sizeof(guidBuffer));
    info.guid = guidBuffer;

    info.numButtons = SDL_GetNumJoystickButtons(joystick);
    info.numAxes = SDL_GetNumJoystickAxes(joystick);
    info.numHats = SDL_GetNumJoystickHats(joystick);
    info.hasGamepadMapping = SDL_IsGamepad(id);
    snapshot.push_back(std::move(info));
  }

  std::lock_guard<std::mutex> lock(joysticksSnapshotMutex_);
  joysticksSnapshot_ = std::move(snapshot);
}

std::vector<JoystickInfo> SdlThread::ListJoysticks() {
  std::lock_guard<std::mutex> lock(joysticksSnapshotMutex_);
  return joysticksSnapshot_;
}

std::optional<std::string> SdlThread::MappingForGuid(const std::string& guid) {
  if (!running_.load(std::memory_order_acquire)) {
    return std::nullopt;
  }
  // The mapping table belongs to the gamepad subsystem and is destroyed when
  // that subsystem is quit, which a diagnostics run does deliberately while it
  // reads a controller directly. Querying it in that window reads freed state:
  // usually it appears to work, sometimes it takes the process down. Ask SDL
  // whether the subsystem is actually up rather than tracking it separately,
  // since this runs on the caller's thread and a local flag could be stale.
  if (SDL_WasInit(SDL_INIT_GAMEPAD) == 0) {
    return std::nullopt;
  }

  SDL_GUID parsed = SDL_StringToGUID(guid.c_str());
  char* mapping = SDL_GetGamepadMappingForGUID(parsed);
  if (mapping == nullptr) {
    return std::nullopt;
  }
  std::string result(mapping);
  SDL_free(mapping);
  return result;
}

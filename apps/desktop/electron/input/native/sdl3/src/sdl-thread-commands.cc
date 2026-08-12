/* @layer electron-main @kind native */
// The mutex-guarded command queue (QueueRumble/QueueRescan from the JS
// thread, PumpCommands/ApplyRumble/ApplyRescan draining it on the SDL
// thread) plus the two mapping calls, which bypass that queue entirely.
#include "sdl-thread.h"

#include <algorithm>
#include <utility>

bool SdlThread::QueueRumble(int32_t gamepadId, float low, float high, uint32_t durationMs) {
  if (!running_.load(std::memory_order_acquire)) {
    return false;
  }
  SdlCommand command;
  command.kind = SdlCommand::Kind::kRumble;
  command.gamepadId = gamepadId;
  command.lowFrequency = low;
  command.highFrequency = high;
  command.durationMs = durationMs;
  {
    std::lock_guard<std::mutex> lock(commandMutex_);
    commands_.push_back(std::move(command));
  }
  return true;
}

bool SdlThread::QueueRescan() {
  if (!running_.load(std::memory_order_acquire)) {
    return false;
  }
  SdlCommand command;
  command.kind = SdlCommand::Kind::kRescan;
  {
    std::lock_guard<std::mutex> lock(commandMutex_);
    commands_.push_back(std::move(command));
  }
  return true;
}

bool SdlThread::QueueReleaseGamepads() {
  if (!running_.load(std::memory_order_acquire)) {
    return false;
  }
  SdlCommand command;
  command.kind = SdlCommand::Kind::kReleaseGamepads;
  {
    std::lock_guard<std::mutex> lock(commandMutex_);
    commands_.push_back(std::move(command));
  }
  return true;
}

bool SdlThread::QueueRestoreGamepads() {
  if (!running_.load(std::memory_order_acquire)) {
    return false;
  }
  SdlCommand command;
  command.kind = SdlCommand::Kind::kRestoreGamepads;
  {
    std::lock_guard<std::mutex> lock(commandMutex_);
    commands_.push_back(std::move(command));
  }
  return true;
}

// The two mapping calls run inline rather than through the command queue.
// SDL documents both as safe to call from any thread, and queueing them
// would mean blocking the JS thread on a promise the SDL thread can never
// fulfil if Stop() races the queued command — a hang, not a slow call.
// Callers legitimately load mappings before the SDL thread has finished
// starting, so a not-yet-running subsystem records the request instead of
// rejecting it. ApplyPendingMappings() applies whatever accumulated once SDL
// is up. Returning an error here instead would mean the caller silently ran
// with no mappings at all and only a number in a log to show for it.
bool SdlThread::AddMapping(const std::string& mapping) {
  {
    std::lock_guard<std::mutex> lock(mappingsMutex_);
    mappingStrings_.push_back(mapping);
  }
  if (!running_.load(std::memory_order_acquire)) {
    return true;
  }
  // Returns 1 (added) or 0 (updated) on success, -1 on failure.
  return SDL_AddGamepadMapping(mapping.c_str()) >= 0;
}

int32_t SdlThread::AddMappingsFromFile(const std::string& path) {
  {
    std::lock_guard<std::mutex> lock(mappingsMutex_);
    mappingFiles_.push_back(path);
  }
  if (!running_.load(std::memory_order_acquire)) {
    // Queued, not counted: the real total is only knowable once SDL parses it.
    return 0;
  }
  return SDL_AddGamepadMappingsFromFile(path.c_str());
}

// Applies every mapping recorded so far. Runs on the SDL thread right after
// SDL_Init, and again after a subsystem restore, since quitting the gamepad
// subsystem drops SDL's mapping table.
int32_t SdlThread::ApplyPendingMappings() {
  std::vector<std::string> strings;
  std::vector<std::string> files;
  {
    std::lock_guard<std::mutex> lock(mappingsMutex_);
    strings = mappingStrings_;
    files = mappingFiles_;
  }

  int32_t total = 0;
  for (const auto& mapping : strings) {
    if (SDL_AddGamepadMapping(mapping.c_str()) >= 0) ++total;
  }
  for (const auto& path : files) {
    int32_t count = SDL_AddGamepadMappingsFromFile(path.c_str());
    if (count > 0) total += count;
  }
  return total;
}

void SdlThread::PumpCommands() {
  std::deque<SdlCommand> local;
  {
    std::lock_guard<std::mutex> lock(commandMutex_);
    if (commands_.empty()) {
      return;
    }
    local.swap(commands_);
  }

  for (const auto& command : local) {
    switch (command.kind) {
      case SdlCommand::Kind::kRumble:
        ApplyRumble(command);
        break;
      case SdlCommand::Kind::kRescan:
        ApplyRescan();
        break;
      case SdlCommand::Kind::kHidCaptureOpen:
        ApplyHidCaptureOpen(command);
        break;
      case SdlCommand::Kind::kHidCaptureClose:
        ApplyHidCaptureClose();
        break;
      case SdlCommand::Kind::kJoystickCaptureStart:
        ApplyJoystickCaptureStart(command);
        break;
      case SdlCommand::Kind::kJoystickCaptureStop:
        ApplyJoystickCaptureStop();
        break;
      case SdlCommand::Kind::kReleaseGamepads:
        ApplyReleaseGamepads();
        break;
      case SdlCommand::Kind::kRestoreGamepads:
        ApplyRestoreGamepads();
        break;
    }
  }
}

void SdlThread::ApplyRumble(const SdlCommand& command) {
  auto it = gamepads_.find(command.gamepadId);
  if (it == gamepads_.end()) {
    return;
  }
  Uint16 low = static_cast<Uint16>(std::clamp(command.lowFrequency, 0.0f, 1.0f) * 65535.0f);
  Uint16 high = static_cast<Uint16>(std::clamp(command.highFrequency, 0.0f, 1.0f) * 65535.0f);
  SDL_RumbleGamepad(it->second, low, high, command.durationMs);
}

// SDL caches its device list, so a controller freed by another application
// after startup never reappears on its own. Tearing the gamepad subsystem
// down and back up makes SDL re-probe. A stale raw HID handle has no
// business surviving a "refresh everything" request either, so it is
// closed first. The actual teardown/rebuild is ApplyReleaseGamepads
// immediately followed by ApplyRestoreGamepads (see sdl-thread-gamepad-
// hold.cc): SDL re-synthesizes SDL_EVENT_GAMEPAD_ADDED for everything it
// can claim, which HandleEvent picks up on the next loop iteration through
// OpenGamepad with no special casing here, and every mapping this addon
// has added is replayed since SDL drops its mapping table along the way.
void SdlThread::ApplyRescan() {
  ApplyHidCaptureClose();
  ApplyReleaseGamepads();
  ApplyRestoreGamepads();
}

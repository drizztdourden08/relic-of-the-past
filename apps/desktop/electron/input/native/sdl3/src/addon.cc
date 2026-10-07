/* @layer electron-main @kind native */
// Node-API surface for the SDL3 gamepad addon. Every exported function
// here just validates arguments and delegates to a single SdlThread
// instance; no SDL call happens on this (the JS) thread. See sdl-thread.h
// for the actual SDL lifecycle and event handling.
#include <napi.h>

#include <SDL3/SDL.h>

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "addon-handlers.h"
#include "sdl-thread.h"

namespace {

std::unique_ptr<SdlThread> g_sdlThread;

}  // namespace

// Shared with addon-raw-capture.cc / addon-joystick.cc, which define
// handlers for the two capabilities added on top of this addon's original
// gamepad/rumble/mapping surface. See addon-handlers.h.
SdlThread* GetSdlThread(bool createIfMissing) {
  if (!g_sdlThread && createIfMissing) {
    g_sdlThread = std::make_unique<SdlThread>();
  }
  return g_sdlThread.get();
}

namespace {

Napi::Value Start(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsFunction()) {
    Napi::TypeError::New(env, "start(callback) requires a function").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!g_sdlThread) {
    g_sdlThread = std::make_unique<SdlThread>();
  }

  Napi::ThreadSafeFunction tsfn = Napi::ThreadSafeFunction::New(
      env, info[0].As<Napi::Function>(), "SDL3GamepadCallback", 0, 1);

  g_sdlThread->Start(std::move(tsfn));
  return env.Undefined();
}

Napi::Value Stop(const Napi::CallbackInfo& info) {
  if (g_sdlThread) {
    g_sdlThread->Stop();
  }
  return info.Env().Undefined();
}

Napi::Value Rumble(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!g_sdlThread || info.Length() < 4) {
    return Napi::Boolean::New(env, false);
  }

  int32_t id = info[0].As<Napi::Number>().Int32Value();
  float low = info[1].As<Napi::Number>().FloatValue();
  float high = info[2].As<Napi::Number>().FloatValue();
  uint32_t durationMs = info[3].As<Napi::Number>().Uint32Value();

  return Napi::Boolean::New(env, g_sdlThread->QueueRumble(id, low, high, durationMs));
}

Napi::Value AddMapping(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsString()) {
    return Napi::Boolean::New(env, false);
  }
  // Same reasoning as AddMappingsFromFile: record it even before Start().
  if (!g_sdlThread) {
    g_sdlThread = std::make_unique<SdlThread>();
  }

  std::string mapping = info[0].As<Napi::String>().Utf8Value();
  return Napi::Boolean::New(env, g_sdlThread->AddMapping(mapping));
}

Napi::Value AddMappingsFromFile(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsString()) {
    return Napi::Number::New(env, -1);
  }
  // Mapping databases are normally loaded during startup, before Start() has
  // created the thread. Create it here so the request is recorded instead of
  // refused; it is applied as soon as SDL comes up.
  if (!g_sdlThread) {
    g_sdlThread = std::make_unique<SdlThread>();
  }

  std::string path = info[0].As<Napi::String>().Utf8Value();
  return Napi::Number::New(env, g_sdlThread->AddMappingsFromFile(path));
}

Napi::Value EnumerateHid(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!g_sdlThread) {
    g_sdlThread = std::make_unique<SdlThread>();
  }

  std::vector<HidDeviceInfo> devices = g_sdlThread->EnumerateHid();
  Napi::Array result = Napi::Array::New(env, devices.size());
  for (size_t i = 0; i < devices.size(); ++i) {
    Napi::Object object = Napi::Object::New(env);
    object.Set("vendorId", devices[i].vendorId);
    object.Set("productId", devices[i].productId);
    object.Set("productString", devices[i].productString);
    object.Set("manufacturerString", devices[i].manufacturerString);
    object.Set("path", devices[i].path);
    object.Set("busType", devices[i].busType);
    result.Set(i, object);
  }
  return result;
}

Napi::Value Rescan(const Napi::CallbackInfo& info) {
  if (g_sdlThread) {
    g_sdlThread->QueueRescan();
  }
  return info.Env().Undefined();
}

Napi::Value ReleaseGamepads(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!g_sdlThread) {
    return Napi::Boolean::New(env, false);
  }
  return Napi::Boolean::New(env, g_sdlThread->QueueReleaseGamepads());
}

Napi::Value RestoreGamepads(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!g_sdlThread) {
    return Napi::Boolean::New(env, false);
  }
  return Napi::Boolean::New(env, g_sdlThread->QueueRestoreGamepads());
}

Napi::Value Version(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int version = SDL_GetVersion();
  std::string versionString = std::to_string(SDL_VERSIONNUM_MAJOR(version)) + "." +
                               std::to_string(SDL_VERSIONNUM_MINOR(version)) + "." +
                               std::to_string(SDL_VERSIONNUM_MICRO(version));
  return Napi::String::New(env, versionString);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("start", Napi::Function::New(env, Start));
  exports.Set("stop", Napi::Function::New(env, Stop));
  exports.Set("rumble", Napi::Function::New(env, Rumble));
  exports.Set("addMapping", Napi::Function::New(env, AddMapping));
  exports.Set("addMappingsFromFile", Napi::Function::New(env, AddMappingsFromFile));
  exports.Set("enumerateHid", Napi::Function::New(env, EnumerateHid));
  exports.Set("rescan", Napi::Function::New(env, Rescan));
  exports.Set("releaseGamepads", Napi::Function::New(env, ReleaseGamepads));
  exports.Set("restoreGamepads", Napi::Function::New(env, RestoreGamepads));
  exports.Set("version", Napi::Function::New(env, Version));
  exports.Set("startRawCapture", Napi::Function::New(env, StartRawCapture));
  exports.Set("stopRawCapture", Napi::Function::New(env, StopRawCapture));
  exports.Set("startJoystickCapture", Napi::Function::New(env, StartJoystickCapture));
  exports.Set("stopJoystickCapture", Napi::Function::New(env, StopJoystickCapture));
  exports.Set("listJoysticks", Napi::Function::New(env, ListJoysticks));
  exports.Set("mappingForGuid", Napi::Function::New(env, MappingForGuid));
  return exports;
}

}  // namespace

NODE_API_MODULE(sdl3_input, Init)

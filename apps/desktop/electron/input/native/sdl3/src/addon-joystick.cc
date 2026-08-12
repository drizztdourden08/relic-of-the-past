/* @layer electron-main @kind native */
// N-API handlers for the joystick-level surface: start/stop capture,
// listJoysticks (marshals SdlThread's JoystickInfo snapshot into plain
// objects), and mappingForGuid. Split out of addon.cc to keep that file
// under the line cap.
#include "addon-handlers.h"

#include <cstdint>
#include <optional>
#include <string>
#include <vector>

Napi::Value StartJoystickCapture(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  SdlThread* thread = GetSdlThread(false);
  if (!thread || info.Length() < 1) {
    return Napi::Boolean::New(env, false);
  }

  int32_t joystickId = info[0].As<Napi::Number>().Int32Value();
  return Napi::Boolean::New(env, thread->StartJoystickCapture(joystickId));
}

Napi::Value StopJoystickCapture(const Napi::CallbackInfo& info) {
  SdlThread* thread = GetSdlThread(false);
  if (thread) {
    thread->StopJoystickCapture();
  }
  return info.Env().Undefined();
}

Napi::Value ListJoysticks(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  SdlThread* thread = GetSdlThread(true);

  std::vector<JoystickInfo> joysticks = thread->ListJoysticks();
  Napi::Array result = Napi::Array::New(env, joysticks.size());
  for (size_t i = 0; i < joysticks.size(); ++i) {
    Napi::Object object = Napi::Object::New(env);
    object.Set("id", joysticks[i].id);
    object.Set("name", joysticks[i].name);
    object.Set("guid", joysticks[i].guid);
    object.Set("numButtons", joysticks[i].numButtons);
    object.Set("numAxes", joysticks[i].numAxes);
    object.Set("numHats", joysticks[i].numHats);
    object.Set("hasGamepadMapping", joysticks[i].hasGamepadMapping);
    result.Set(i, object);
  }
  return result;
}

Napi::Value MappingForGuid(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  SdlThread* thread = GetSdlThread(false);
  if (!thread || info.Length() < 1 || !info[0].IsString()) {
    return env.Null();
  }

  std::string guid = info[0].As<Napi::String>().Utf8Value();
  std::optional<std::string> mapping = thread->MappingForGuid(guid);
  if (!mapping.has_value()) {
    return env.Null();
  }
  return Napi::String::New(env, *mapping);
}

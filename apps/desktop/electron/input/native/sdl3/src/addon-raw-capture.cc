/* @layer electron-main @kind native */
// N-API handlers for the raw HID capture surface: StartRawCapture converts
// SdlThread's RawCaptureResult into the plain {success, reason?, message?}
// object the JS side needs to tell "unavailable-exclusive" apart from
// "not-found" and "error" (see sdl-raw-capture.h). Split out of addon.cc to
// keep that file under the line cap.
#include "addon-handlers.h"

#include <cstdint>

namespace {

const char* ReasonToString(RawCaptureResult::Status status) {
  switch (status) {
    case RawCaptureResult::Status::kNotFound:
      return "not-found";
    case RawCaptureResult::Status::kUnavailableExclusive:
      return "unavailable-exclusive";
    case RawCaptureResult::Status::kOk:
    case RawCaptureResult::Status::kError:
    default:
      return "error";
  }
}

}  // namespace

Napi::Value StartRawCapture(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  SdlThread* thread = GetSdlThread(false);
  if (!thread || info.Length() < 2) {
    Napi::Object failure = Napi::Object::New(env);
    failure.Set("success", false);
    failure.Set("reason", "error");
    failure.Set("message", "SDL thread not started");
    return failure;
  }

  int32_t vendorId = info[0].As<Napi::Number>().Int32Value();
  int32_t productId = info[1].As<Napi::Number>().Int32Value();
  RawCaptureResult result = thread->StartRawCapture(vendorId, productId);

  Napi::Object object = Napi::Object::New(env);
  if (result.status == RawCaptureResult::Status::kOk) {
    object.Set("success", true);
    return object;
  }
  object.Set("success", false);
  object.Set("reason", ReasonToString(result.status));
  object.Set("message", result.message);
  return object;
}

Napi::Value StopRawCapture(const Napi::CallbackInfo& info) {
  SdlThread* thread = GetSdlThread(false);
  if (thread) {
    thread->StopRawCapture();
  }
  return info.Env().Undefined();
}

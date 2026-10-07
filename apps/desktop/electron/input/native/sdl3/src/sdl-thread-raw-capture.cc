/* @layer electron-main @kind native */
// Raw HID capture: the JS-thread-facing Start/StopRawCapture, the SDL-
// thread-side open/close applied from PumpCommands, the per-tick poll
// PollRawCapture() run from Run(), and the emit call site for the resulting
// events. This is a diagnostic byte view, independent of SDL's own gamepad
// backend: it names no vendor or product beyond the ids the caller passed
// in, and it deliberately expects to fail for a device SDL already holds
// exclusively through libusb.
#include "sdl-thread.h"

#include <array>
#include <chrono>
#include <utility>

void SdlThread::ApplyHidCaptureOpen(const SdlCommand& command) {
  ApplyHidCaptureClose();  // only one capture at a time

  RawCaptureResult result;
  SDL_hid_device* handle = SDL_hid_open(static_cast<unsigned short>(command.hidVendorId),
                                         static_cast<unsigned short>(command.hidProductId), nullptr);
  if (handle != nullptr) {
    rawCapture_.handle = handle;
    rawCapture_.vendorId = command.hidVendorId;
    rawCapture_.productId = command.hidProductId;
    result.status = RawCaptureResult::Status::kOk;
  } else {
    // hidapi has no dedicated "already open elsewhere" error code, so a device
    // held exclusively (expected when SDL itself holds it through libusb) is
    // told apart from an absent one by whether the same vendor/product still
    // shows up in a fresh enumeration. That scan never opens the device, so an
    // exclusive open elsewhere does not hide it. SDL_GetError() here describes
    // hid_open's own failure path and often disagrees with that distinction, so
    // it is surfaced as `message` only for the fallback below.
    SDL_hid_device_info* first = SDL_hid_enumerate(static_cast<unsigned short>(command.hidVendorId),
                                                    static_cast<unsigned short>(command.hidProductId));
    const bool stillPresent = first != nullptr;
    SDL_hid_free_enumeration(first);

    result.status = stillPresent ? RawCaptureResult::Status::kUnavailableExclusive
                                  : RawCaptureResult::Status::kNotFound;
  }

  std::lock_guard<std::mutex> lock(rawCapture_.resultMutex);
  rawCapture_.result = result;
  rawCapture_.resultReady = true;
  rawCapture_.resultCv.notify_all();
}

void SdlThread::ApplyHidCaptureClose() {
  if (rawCapture_.handle == nullptr) {
    return;
  }
  SDL_hid_close(rawCapture_.handle);
  rawCapture_.handle = nullptr;
  rawCapture_.vendorId = 0;
  rawCapture_.productId = 0;
}

// Non-blocking (milliseconds = 0), called once per Run() tick right after
// PumpCommands so a capture in progress never delays the ~16ms cadence the
// rest of the loop depends on.
void SdlThread::PollRawCapture() {
  if (rawCapture_.handle == nullptr) {
    return;
  }

  std::array<unsigned char, 256> buffer{};
  int read = SDL_hid_read_timeout(rawCapture_.handle, buffer.data(), buffer.size(), 0);
  if (read <= 0) {
    return;
  }

  auto* event = new RawHidEvent();
  event->vendorId = rawCapture_.vendorId;
  event->productId = rawCapture_.productId;
  event->reportId = buffer[0];
  event->bytes.assign(buffer.begin(), buffer.begin() + read);
  EmitRaw(event);
}

RawCaptureResult SdlThread::StartRawCapture(int32_t vendorId, int32_t productId) {
  if (!running_.load(std::memory_order_acquire)) {
    RawCaptureResult result;
    result.status = RawCaptureResult::Status::kError;
    result.message = "SDL thread is not running";
    return result;
  }

  {
    std::lock_guard<std::mutex> lock(rawCapture_.resultMutex);
    rawCapture_.resultReady = false;
  }

  SdlCommand command;
  command.kind = SdlCommand::Kind::kHidCaptureOpen;
  command.hidVendorId = vendorId;
  command.hidProductId = productId;
  {
    std::lock_guard<std::mutex> lock(commandMutex_);
    commands_.push_back(std::move(command));
  }

  std::unique_lock<std::mutex> lock(rawCapture_.resultMutex);
  const bool signaled = rawCapture_.resultCv.wait_for(
      lock, std::chrono::milliseconds(500), [this] { return rawCapture_.resultReady; });
  if (!signaled) {
    RawCaptureResult result;
    result.status = RawCaptureResult::Status::kError;
    result.message = "timed out waiting for the SDL thread";
    return result;
  }
  return rawCapture_.result;
}

void SdlThread::StopRawCapture() {
  if (!running_.load(std::memory_order_acquire)) {
    return;
  }
  SdlCommand command;
  command.kind = SdlCommand::Kind::kHidCaptureClose;
  std::lock_guard<std::mutex> lock(commandMutex_);
  commands_.push_back(std::move(command));
}

void SdlThread::EmitRaw(RawHidEvent* event) {
  napi_status status = tsfn_.NonBlockingCall(
      event, [](Napi::Env env, Napi::Function callback, RawHidEvent* data) {
        Napi::Object object = Napi::Object::New(env);
        object.Set("type", "raw");
        object.Set("vendorId", data->vendorId);
        object.Set("productId", data->productId);
        object.Set("reportId", data->reportId);

        Napi::Array bytes = Napi::Array::New(env, data->bytes.size());
        for (size_t i = 0; i < data->bytes.size(); ++i) {
          bytes.Set(i, data->bytes[i]);
        }
        object.Set("bytes", bytes);

        callback.Call({object});
        delete data;
      });

  if (status != napi_ok) {
    delete event;
  }
}

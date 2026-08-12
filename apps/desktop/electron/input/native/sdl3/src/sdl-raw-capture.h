/* @layer electron-main @kind native */
// Data types for the raw HID capture path: the result handed back to
// StartRawCapture once the SDL thread has processed the open request, the
// event emitted per report while capturing, and the state kept between
// SdlThread::Run() ticks. Split out of sdl-thread.h to keep that file under
// the line cap.
#pragma once

#include <SDL3/SDL.h>

#include <condition_variable>
#include <cstdint>
#include <mutex>
#include <string>
#include <vector>

// Outcome of an open attempt. `kUnavailableExclusive` is the expected case
// for a controller SDL already holds through libusb; `kNotFound` means no
// matching device is enumerable at all; `kError` carries whatever
// SDL_GetError() said. The caller needs to tell these apart, so this is
// never collapsed into a bare bool.
struct RawCaptureResult {
  enum class Status { kOk, kNotFound, kUnavailableExclusive, kError };

  Status status = Status::kError;
  std::string message;
};

// One HID input report read while capturing, built on the SDL thread and
// handed to the emit lambda in sdl-thread-raw-capture.cc.
struct RawHidEvent {
  int32_t vendorId = 0;
  int32_t productId = 0;
  int32_t reportId = 0;
  std::vector<uint8_t> bytes;
};

// Everything the raw capture feature keeps between ticks and across the
// JS-thread/SDL-thread boundary. `handle`/vendorId/productId are touched
// only on the SDL thread; the result fields are the hand-off point back to
// whichever StartRawCapture call on the JS thread is waiting on them.
struct RawCaptureState {
  SDL_hid_device* handle = nullptr;
  int32_t vendorId = 0;
  int32_t productId = 0;

  std::mutex resultMutex;
  std::condition_variable resultCv;
  bool resultReady = false;
  RawCaptureResult result;
};

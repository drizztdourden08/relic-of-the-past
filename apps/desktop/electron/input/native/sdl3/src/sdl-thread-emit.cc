/* @layer electron-main @kind native */
// Packages a GamepadEvent into the plain JS object the ThreadSafeFunction
// callback in addon.cc expects, and hands it across via NonBlockingCall.
#include "sdl-thread.h"

void SdlThread::Emit(GamepadEvent* event) {
  napi_status status = tsfn_.NonBlockingCall(
      event, [](Napi::Env env, Napi::Function callback, GamepadEvent* data) {
        Napi::Object object = Napi::Object::New(env);
        switch (data->kind) {
          case GamepadEvent::Kind::kAdded: {
            object.Set("type", "added");
            object.Set("id", data->id);
            object.Set("name", data->name);
            object.Set("vendorId", data->vendorId);
            object.Set("productId", data->productId);
            object.Set("guid", data->guid);
            object.Set("hasRumble", data->hasRumble);
            object.Set("hasGyro", data->hasGyro);
            object.Set("connectionState", data->connectionState);
            object.Set("sdlType", data->sdlType);

            Napi::Array hasButton = Napi::Array::New(env, data->hasButton.size());
            for (size_t i = 0; i < data->hasButton.size(); ++i) {
              hasButton.Set(i, data->hasButton[i]);
            }
            object.Set("hasButton", hasButton);

            Napi::Array hasAxis = Napi::Array::New(env, data->hasAxis.size());
            for (size_t i = 0; i < data->hasAxis.size(); ++i) {
              hasAxis.Set(i, data->hasAxis[i]);
            }
            object.Set("hasAxis", hasAxis);

            Napi::Array buttonLabels = Napi::Array::New(env, data->buttonLabels.size());
            for (size_t i = 0; i < data->buttonLabels.size(); ++i) {
              buttonLabels.Set(i, data->buttonLabels[i]);
            }
            object.Set("buttonLabels", buttonLabels);
            break;
          }
          case GamepadEvent::Kind::kRemoved:
            object.Set("type", "removed");
            object.Set("id", data->id);
            break;
          case GamepadEvent::Kind::kState: {
            object.Set("type", "state");
            object.Set("id", data->id);

            Napi::Array buttons = Napi::Array::New(env, data->buttons.size());
            for (size_t i = 0; i < data->buttons.size(); ++i) {
              buttons.Set(i, data->buttons[i]);
            }
            object.Set("buttons", buttons);

            Napi::Array axes = Napi::Array::New(env, data->axes.size());
            for (size_t i = 0; i < data->axes.size(); ++i) {
              axes.Set(i, data->axes[i]);
            }
            object.Set("axes", axes);
            break;
          }
          case GamepadEvent::Kind::kError:
            object.Set("type", "error");
            object.Set("message", data->message);
            break;
        }
        callback.Call({object});
        delete data;
      });

  if (status != napi_ok) {
    delete event;
  }
}

void SdlThread::EmitError(const std::string& message) {
  auto* error = new GamepadEvent();
  error->kind = GamepadEvent::Kind::kError;
  error->message = message;
  Emit(error);
}

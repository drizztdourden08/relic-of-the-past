// @layer installer @kind types
#pragma once

#include <windows.h>

#include <string>

#include "manifest.h"
#include "paint.h"

namespace flow {

// Long operations run off the message loop and report back by posting to the
// window, so the state machine only ever changes on the thread that paints.
enum : UINT {
  kManifestReady = WM_APP + 1,
  kProgress,
  kFinished,
  kFailed,
};

enum : WPARAM {
  kFailNetwork = 1,
  kFailChecksum,
  kFailUnpack,
  kFailLaunch,
};

const manifest::Document& Doc();

void StartCheck(HWND window);
void StartHandoff(HWND window);
void StartInstall(HWND window, ui::Mode mode, const std::wstring& path);
void Cancel();

}  // namespace flow

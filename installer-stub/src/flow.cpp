// @layer installer @kind logic
#include "flow.h"

#include <atomic>
#include <thread>

#include "install.h"
#include "net.h"
#include "state.h"

namespace flow {
namespace {

manifest::Document g_doc;
std::atomic<bool> g_cancel{false};

net::Progress Reporter(HWND window) {
  return [window](unsigned long long done, unsigned long long total) {
    PostMessageW(window, kProgress, static_cast<WPARAM>(done), static_cast<LPARAM>(total));
    return !g_cancel.load();
  };
}

// Every mode starts the same way: pull one artifact down and refuse to run it
// unless it matches the digest the manifest published for it.
bool Acquire(HWND window, const manifest::Artifact& artifact, const wchar_t* suffix,
             std::wstring* file) {
  if (artifact.url.empty()) {
    PostMessageW(window, kFailed, kFailNetwork, 0);
    return false;
  }
  *file = install::TempFile(suffix);
  if (!net::DownloadFile(artifact.url, *file, Reporter(window))) {
    PostMessageW(window, kFailed, kFailNetwork, 0);
    return false;
  }
  if (!net::VerifyFile(*file, artifact.sha256)) {
    DeleteFileW(file->c_str());
    PostMessageW(window, kFailed, kFailChecksum, 0);
    return false;
  }
  return true;
}

void CheckWorker(HWND window) {
  if (!manifest::Fetch(&g_doc, app::g.manifestUrl)) {
    PostMessageW(window, kFailed, kFailNetwork, 0);
    return;
  }
  PostMessageW(window, kManifestReady, 0, 0);
}

void HandoffWorker(HWND window) {
  std::wstring file;
  if (!Acquire(window, g_doc.stub, L".exe", &file)) return;
  if (!install::Handoff(file)) {
    PostMessageW(window, kFailed, kFailLaunch, 0);
    return;
  }
  PostMessageW(window, kFinished, 0, 0);
}

void InstallWorker(HWND window, ui::Mode mode, std::wstring path) {
  if (mode == ui::Mode::Portable) {
    std::wstring archive;
    if (!Acquire(window, g_doc.portable, L".zip", &archive)) return;
    bool unpacked = install::Unpack(archive, path);
    DeleteFileW(archive.c_str());
    if (unpacked) {
      // The marker travels inside the zip; this is the folder that makes the copy
      // keep its profiles and saves beside itself.
      CreateDirectoryW((path + L"\\data").c_str(), nullptr);
      install::LaunchInstalled(path);
    }
    PostMessageW(window, unpacked ? kFinished : kFailed, unpacked ? 0 : kFailUnpack, 0);
    return;
  }

  std::wstring setup;
  if (!Acquire(window, g_doc.setup, L".exe", &setup)) return;
  std::vector<std::wstring> args = g_doc.setupArgs;
  bool elevated = mode == ui::Mode::Global;
  if (elevated) {
    args.push_back(L"--installto");
    args.push_back(path);
  }
  if (!install::RunSetup(setup, args, elevated)) {
    PostMessageW(window, kFailed, kFailLaunch, 0);
    return;
  }
  install::LaunchInstalled(install::InstalledRoot(mode, path));
  PostMessageW(window, kFinished, 0, 0);
}

}  // namespace

const manifest::Document& Doc() { return g_doc; }

void StartCheck(HWND window) { std::thread(CheckWorker, window).detach(); }

void StartHandoff(HWND window) { std::thread(HandoffWorker, window).detach(); }

void StartInstall(HWND window, ui::Mode mode, const std::wstring& path) {
  std::thread(InstallWorker, window, mode, path).detach();
}

void Cancel() { g_cancel.store(true); }

}  // namespace flow

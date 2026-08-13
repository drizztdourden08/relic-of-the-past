// @layer installer @kind types
#pragma once

#include <string>
#include <vector>

namespace manifest {

struct Artifact {
  std::wstring url;
  std::wstring sha256;
};

struct Document {
  int stubVersion = 0;
  Artifact stub;
  Artifact setup;
  std::vector<std::wstring> setupArgs;
  Artifact portable;
  std::wstring version;
};

// The document always lives at the same address, which redirects to whichever
// release is current, so the stub never carries a version-specific link.
extern const wchar_t kManifestUrl[];

bool Parse(const std::string& json, Document* out);
/** Reads the recipe. `url` empty means the published one at kManifestUrl. */
bool Fetch(Document* out, const std::wstring& url = std::wstring());

}  // namespace manifest

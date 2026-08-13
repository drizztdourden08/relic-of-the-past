// @layer installer @kind types
#pragma once

#include <functional>
#include <string>

namespace net {

// Called as bytes land. Returning false aborts the transfer, which is how a
// closed window stops a download that is already in flight.
using Progress = std::function<bool(unsigned long long done, unsigned long long total)>;

bool FetchText(const std::wstring& url, std::string* out);
bool DownloadFile(const std::wstring& url, const std::wstring& path, const Progress& progress);

bool Sha256File(const std::wstring& path, std::wstring* hex);
bool VerifyFile(const std::wstring& path, const std::wstring& expected);

}  // namespace net

// @layer installer @kind constants
#pragma once

#include <windows.h>

namespace theme {

// Every rect below is expressed in logical pixels against this canvas. The
// window is created at this size times the monitor scale, and the painter
// applies the same factor as a transform, so one set of numbers serves both
// the live window and the offscreen PNG render at any scale.
constexpr int kWidth = 480;
constexpr int kHeight = 360;

// The manifest carries the stub generation it expects. A build older than that
// number cannot be trusted to understand the rest of the document, so it steps
// aside for a fresh download instead of guessing.
constexpr int kStubVersion = 1;

// Stored as plain DWORDs so this header stays free of the graphics headers;
// the painter wraps each one in a colour object at the point of use.
constexpr DWORD kGround = 0xFF12100E;
constexpr DWORD kSurface = 0xFF1B1815;
constexpr DWORD kHairline = 0xFF322B24;
constexpr DWORD kText = 0xFFECE6DA;
constexpr DWORD kDim = 0xFFA89E8D;
constexpr DWORD kFaint = 0xFF7C7365;
constexpr DWORD kAccent = 0xFFE8A33D;
constexpr DWORD kTrack = 0xFF221E1A;
constexpr DWORD kInk = 0xFF1A1207;
// Barely there: present for anyone who looks for it, invisible to everyone else.
constexpr DWORD kStamp = 0xFF463F36;

constexpr wchar_t kFontFamily[] = L"Segoe UI";
constexpr wchar_t kProduct[] = L"Relic of the Past";
// Velopack's pack id, which is also the folder a per-user install lands in.
constexpr wchar_t kPackId[] = L"relic-of-the-past";
constexpr wchar_t kBrand[] = L"RELIC OF THE PAST";

// The line under the mark identifies the installer itself; the status of what it is
// doing sits lower, where an error would also appear.
constexpr wchar_t kCheckingStatus[] = L"Checking for newer version...";
constexpr wchar_t kInstallerLabel[] = L"Installer";

constexpr wchar_t kHandoffTitle[] = L"A NEWER INSTALLER IS NEEDED";
constexpr wchar_t kHandoffBody[] =
    L"This installer came with an older release. The current one will take "
    L"over from here and finish the job.";
constexpr wchar_t kHandoffFine[] =
    L"About 1 MB. Your choices come after, on the new installer's own first "
    L"screen.";

constexpr wchar_t kWelcomeBlurb[] =
    L"A modern desktop launcher for the open-source PC port, with a polished UI "
    L"and a feature set that keeps growing.";
constexpr wchar_t kWelcomeFine[] =
    L"Install for the current user only but doesn't require admin privileges.";
constexpr wchar_t kLocationGlobalTitle[] = L"INSTALL GLOBALLY";
constexpr wchar_t kLocationPortableTitle[] = L"PORTABLE FOLDER";
constexpr wchar_t kLocationLabel[] = L"Destination folder";
constexpr wchar_t kLocationGlobalNote[] =
    L"Everyone who signs in to this PC gets the app. The OS might ask for admin "
    L"privilege to finish this installation and during auto update.";
constexpr wchar_t kLocationPortableNote[] =
    L"In portable mode, the app files and user data all live in a single folder "
    L"and work independently from the OS.";

constexpr wchar_t kProgressFoot[] = L"This window closes itself and starts the app.";

}  // namespace theme

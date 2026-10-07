# Android native build for the controller-input Capacitor plugin. Builds SDL3 from
# the SAME pinned source as the desktop addon (apps/desktop/electron/input/native/
# sdl3); SDL3_SOURCE_DIR comes from app/build.gradle, which reads the pin from that
# addon's package.json.
#
# Statically linked (SDL_STATIC): one controllersdl3.so instead of two libraries
# that must find each other on the APK's native lib path.
#
# Video/audio/render/camera subsystems are left at SDL3's Android defaults; trimming
# them for APK size is a follow-up once this links.
cmake_minimum_required(VERSION 3.22)
# CXX because SDL3's Android hidapi backend (src/hidapi/android/hid.cpp) is C++.
# With C only, CMake links through clang instead of clang++ and the C++ runtime
# (operator new/delete, unwinding, __gxx_personality_v0) is never pulled in.
project(controllersdl3 LANGUAGES C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

if(NOT DEFINED SDL3_SOURCE_DIR)
  message(FATAL_ERROR "SDL3_SOURCE_DIR not set - pass it from app/build.gradle's externalNativeBuild.cmake.arguments (see that file's SDL3_SOURCE_DIR computation).")
endif()
if(NOT EXISTS "${SDL3_SOURCE_DIR}/CMakeLists.txt")
  message(FATAL_ERROR "SDL3 source not found at ${SDL3_SOURCE_DIR} - run `npm run ensure-sdl3` first (see scripts/build/fetch-sdl3.mjs).")
endif()

set(SDL_SHARED OFF CACHE BOOL "" FORCE)
set(SDL_STATIC ON CACHE BOOL "" FORCE)
set(SDL_TEST_LIBRARY OFF CACHE BOOL "" FORCE)
set(SDL_TESTS OFF CACHE BOOL "" FORCE)
set(SDL_EXAMPLES OFF CACHE BOOL "" FORCE)
set(SDL_ANDROID_JAR OFF CACHE BOOL "" FORCE)

add_subdirectory("${SDL3_SOURCE_DIR}" sdl3-build)

add_library(controllersdl3 SHARED
  controller_sdl3_jni.c
  sdl3_gamepad_type.c
  sdl3_json.c
)

target_link_libraries(controllersdl3 PRIVATE SDL3::SDL3-static log android)
set_target_properties(controllersdl3 PROPERTIES LINKER_LANGUAGE CXX)

# Devices with 16 KB memory pages refuse to load a 4 KB-aligned library. This NDK
# still defaults to 4 KB; NDK r28 and later do this on their own.
target_link_options(controllersdl3 PRIVATE "-Wl,-z,max-page-size=16384")

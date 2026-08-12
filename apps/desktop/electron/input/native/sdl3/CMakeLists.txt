# Build configuration for the SDL3 gamepad Node-API addon. Produces
# sdl3_input.node, driven by cmake-js (CMAKE_JS_INC/LIB/SRC come from it),
# and copies the SDL3 shared library next to the built addon so the OS
# loader finds it without any extra PATH/RPATH setup at the call site.
cmake_minimum_required(VERSION 3.15)
project(sdl3_input LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# SDL3Config.cmake ships in the official devel package and resolves the
# right include/lib paths for the current arch; never hardcode those here.
find_package(SDL3 REQUIRED CONFIG)

# `include` yields an absolute path (unlike `include_dir`, which is relative to
# the caller's cwd and so resolves wrong from CMake's build directory). It comes
# back quoted and with Windows separators, both of which CMake needs stripped —
# a backslash would otherwise be read as an escape.
execute_process(
  COMMAND node -p "require('node-addon-api').include"
  WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
  OUTPUT_VARIABLE NODE_ADDON_API_DIR
  OUTPUT_STRIP_TRAILING_WHITESPACE
)
string(REPLACE "\"" "" NODE_ADDON_API_DIR "${NODE_ADDON_API_DIR}")
string(REPLACE "\\" "/" NODE_ADDON_API_DIR "${NODE_ADDON_API_DIR}")

if(NOT EXISTS "${NODE_ADDON_API_DIR}/napi.h")
  message(FATAL_ERROR "node-addon-api headers not found at '${NODE_ADDON_API_DIR}'. Run npm install first.")
endif()

add_library(${PROJECT_NAME} SHARED
  src/addon.cc
  src/addon-raw-capture.cc
  src/addon-joystick.cc
  src/libusb-preload.cc
  src/sdl-gamepad-type.cc
  src/sdl-thread-lifecycle.cc
  src/sdl-thread-commands.cc
  src/sdl-thread-gamepad-hold.cc
  src/sdl-thread-hid.cc
  src/sdl-thread-emit.cc
  src/sdl-thread-raw-capture.cc
  src/sdl-thread-joystick.cc
  src/sdl-thread-joystick-capture.cc
  # Needed for the Windows delay-load hook that lets the addon resolve
  # node.exe/electron.exe symbols at runtime.
  ${CMAKE_JS_SRC}
)

set_target_properties(${PROJECT_NAME} PROPERTIES
  PREFIX ""
  SUFFIX ".node"
)

target_include_directories(${PROJECT_NAME} PRIVATE
  ${CMAKE_JS_INC}
  ${NODE_ADDON_API_DIR}
)

target_compile_definitions(${PROJECT_NAME} PRIVATE
  NAPI_DISABLE_CPP_EXCEPTIONS
  NAPI_VERSION=9
)

target_link_libraries(${PROJECT_NAME} PRIVATE
  ${CMAKE_JS_LIB}
  SDL3::SDL3-shared
)

if(APPLE)
  set_target_properties(${PROJECT_NAME} PROPERTIES
    BUILD_RPATH "@loader_path"
    INSTALL_RPATH "@loader_path"
  )
elseif(UNIX)
  set_target_properties(${PROJECT_NAME} PROPERTIES
    BUILD_RPATH "$ORIGIN"
    INSTALL_RPATH "$ORIGIN"
  )
endif()

# The shared library must sit next to the .node file (or on PATH) for the
# loader to resolve it at require() time.
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "$<TARGET_FILE:SDL3::SDL3-shared>"
    "$<TARGET_FILE_DIR:${PROJECT_NAME}>"
  COMMENT "Copying SDL3 shared library next to sdl3_input.node"
)

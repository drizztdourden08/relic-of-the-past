#include "sdl3_gamepad_type.h"

const char *Sdl3GamepadTypeString(SDL_GamepadType type) {
  switch (type) {
    case SDL_GAMEPAD_TYPE_STANDARD:
      return "standard";
    case SDL_GAMEPAD_TYPE_XBOX360:
      return "xbox360";
    case SDL_GAMEPAD_TYPE_XBOXONE:
      return "xboxone";
    case SDL_GAMEPAD_TYPE_PS3:
      return "ps3";
    case SDL_GAMEPAD_TYPE_PS4:
      return "ps4";
    case SDL_GAMEPAD_TYPE_PS5:
      return "ps5";
    case SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_PRO:
      return "switch-pro";
    case SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_LEFT:
      return "joycon-left";
    case SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_RIGHT:
      return "joycon-right";
    case SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_PAIR:
      return "joycon-pair";
    case SDL_GAMEPAD_TYPE_GAMECUBE:
      return "gamecube";
    default:
      return "unknown";
  }
}

const char *Sdl3GamepadButtonLabelString(SDL_GamepadButtonLabel label) {
  switch (label) {
    case SDL_GAMEPAD_BUTTON_LABEL_A:
      return "A";
    case SDL_GAMEPAD_BUTTON_LABEL_B:
      return "B";
    case SDL_GAMEPAD_BUTTON_LABEL_X:
      return "X";
    case SDL_GAMEPAD_BUTTON_LABEL_Y:
      return "Y";
    case SDL_GAMEPAD_BUTTON_LABEL_CROSS:
      return "CROSS";
    case SDL_GAMEPAD_BUTTON_LABEL_CIRCLE:
      return "CIRCLE";
    case SDL_GAMEPAD_BUTTON_LABEL_SQUARE:
      return "SQUARE";
    case SDL_GAMEPAD_BUTTON_LABEL_TRIANGLE:
      return "TRIANGLE";
    default:
      return "";
  }
}

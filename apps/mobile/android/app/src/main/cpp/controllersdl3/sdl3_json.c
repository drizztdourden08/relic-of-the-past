#include "sdl3_json.h"

#include <stdio.h>
#include <string.h>

void Sdl3JsonInit(Sdl3JsonWriter *writer, char *buf, size_t cap) {
  writer->buf = buf;
  writer->cap = cap;
  writer->len = 0;
  if (cap > 0) {
    buf[0] = '\0';
  }
}

void Sdl3JsonRaw(Sdl3JsonWriter *writer, const char *text) {
  size_t textLen = strlen(text);
  // Leave room for the trailing NUL; silently truncate rather than overrun the
  // fixed buffer nativePollEvents() hands us. A truncated batch just gets
  // dropped by the JS-side JSON.parse on the next poll instead of crashing.
  if (writer->len + textLen + 1 > writer->cap) {
    return;
  }
  memcpy(writer->buf + writer->len, text, textLen + 1);
  writer->len += textLen;
}

void Sdl3JsonString(Sdl3JsonWriter *writer, const char *value) {
  Sdl3JsonRaw(writer, "\"");
  for (const char *p = value; *p != '\0'; ++p) {
    unsigned char c = (unsigned char)*p;
    char escaped[8];
    if (c == '"' || c == '\\') {
      escaped[0] = '\\';
      escaped[1] = (char)c;
      escaped[2] = '\0';
    } else if (c == '\n') {
      snprintf(escaped, sizeof(escaped), "\\n");
    } else if (c < 0x20) {
      snprintf(escaped, sizeof(escaped), "\\u%04x", c);
    } else {
      escaped[0] = (char)c;
      escaped[1] = '\0';
    }
    Sdl3JsonRaw(writer, escaped);
  }
  Sdl3JsonRaw(writer, "\"");
}

void Sdl3JsonInt(Sdl3JsonWriter *writer, int value) {
  char text[16];
  snprintf(text, sizeof(text), "%d", value);
  Sdl3JsonRaw(writer, text);
}

void Sdl3JsonFloat(Sdl3JsonWriter *writer, float value) {
  char text[32];
  snprintf(text, sizeof(text), "%.6f", (double)value);
  Sdl3JsonRaw(writer, text);
}

void Sdl3JsonBool(Sdl3JsonWriter *writer, bool value) {
  Sdl3JsonRaw(writer, value ? "true" : "false");
}

void Sdl3JsonBoolArray(Sdl3JsonWriter *writer, const bool *values, int count) {
  Sdl3JsonRaw(writer, "[");
  for (int i = 0; i < count; ++i) {
    if (i > 0) {
      Sdl3JsonRaw(writer, ",");
    }
    Sdl3JsonBool(writer, values[i]);
  }
  Sdl3JsonRaw(writer, "]");
}

void Sdl3JsonFloatArray(Sdl3JsonWriter *writer, const float *values, int count) {
  Sdl3JsonRaw(writer, "[");
  for (int i = 0; i < count; ++i) {
    if (i > 0) {
      Sdl3JsonRaw(writer, ",");
    }
    Sdl3JsonFloat(writer, values[i]);
  }
  Sdl3JsonRaw(writer, "]");
}

void Sdl3JsonStringArray(Sdl3JsonWriter *writer, const char *const *values, int count) {
  Sdl3JsonRaw(writer, "[");
  for (int i = 0; i < count; ++i) {
    if (i > 0) {
      Sdl3JsonRaw(writer, ",");
    }
    Sdl3JsonString(writer, values[i]);
  }
  Sdl3JsonRaw(writer, "]");
}

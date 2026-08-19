/* @layer core-game-hooks @kind native */
#include "host_gates.h"

uint32 g_host_gates[kHostGateWordCount];

void HostGates_SetWord(int index, uint32 value) {
  if ((unsigned)index < (unsigned)kHostGateWordCount)
    g_host_gates[index] = value;
}

uint32 HostGates_GetWord(int index) {
  return (unsigned)index < (unsigned)kHostGateWordCount ? g_host_gates[index] : 0;
}

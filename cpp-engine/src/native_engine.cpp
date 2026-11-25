#include "rex_native_engine.h"
#include <algorithm>
#include <cstring>
#include <cctype>

extern "C" {
const char* rex_engine_version(void) { return "0.1.0"; }
void rex_normalize_name(const char* input, char* output, size_t output_size) {
 if (!output || output_size == 0) return;
 if (!input) { output[0] = '\0'; return; }
 size_t i=0;
 while (input[i] && i + 1 < output_size) { char c=input[i]; output[i]=static_cast<char>(std::tolower(static_cast<unsigned char>(c))); ++i; }
 output[i]='\0';
}
}

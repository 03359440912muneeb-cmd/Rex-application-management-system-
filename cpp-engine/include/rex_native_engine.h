#pragma once
#include <stddef.h>
extern "C" {
const char* rex_engine_version(void);
void rex_normalize_name(const char* input, char* output, size_t output_size);
}

#include "rex_native_engine.h"
#include <cassert>
#include <cstring>
int main(){ char out[32]; rex_normalize_name("Rex Manager",out,sizeof out); assert(std::strcmp(out,"rex manager")==0); assert(rex_engine_version()!=nullptr); }

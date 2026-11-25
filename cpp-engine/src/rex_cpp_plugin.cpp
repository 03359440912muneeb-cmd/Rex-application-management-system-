#include "rex_native_engine.h"

#include <cstddef>
#include <cstring>

namespace {
constexpr const char kPluginName[] = "rex-cpp-engine";
constexpr const char kPluginVersion[] = "0.2.0";
constexpr const char kThemeJson[] = R"({"name":"Rex Neon Red","mode":"dark","colors":{"background":"#090507","surface":"#171013","surfaceRaised":"#24171d","primary":"#d91845","primaryHover":"#ef315d","accent":"#ff6b8a","text":"#f4edf0","muted":"#b9abb0","border":"#3a252d"}})";
}

extern "C" {

const char* rex_cpp_plugin_name() {
    return kPluginName;
}

const char* rex_cpp_plugin_version() {
    return kPluginVersion;
}

const char* rex_cpp_plugin_theme_json() {
    return kThemeJson;
}

int rex_cpp_plugin_copy_theme(char* output, size_t output_size) {
    if (output == nullptr || output_size == 0) {
        return 0;
    }

    const size_t theme_length = std::char_traits<char>::length(kThemeJson);
    const size_t copied = (theme_length < output_size - 1)
        ? theme_length
        : output_size - 1;

    std::memcpy(output, kThemeJson, copied);
    output[copied] = '\0';
    return static_cast<int>(copied);
}

}

cmake_minimum_required(VERSION 3.20)
project(rex_native_engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(rex_native_engine STATIC src/native_engine.cpp)
target_include_directories(rex_native_engine PUBLIC include)

add_library(rex_cpp_plugin MODULE src/rex_cpp_plugin.cpp)
target_include_directories(rex_cpp_plugin PRIVATE include)
set_target_properties(rex_cpp_plugin PROPERTIES
    PREFIX ""
    OUTPUT_NAME "rex_cpp_plugin"
)

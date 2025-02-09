import { execSync } from "child_process"
import path from "path"

const DOOM_DIR = path.join(__dirname, "..", "doom-src")
const OUTPUT_DIR = path.join(__dirname, "..", "public")

const EMSCRIPTEN_ARGS = [
  "-s WASM=1",
  "-s ASYNCIFY",
  "-s ALLOW_MEMORY_GROWTH=1",
  "-s TOTAL_MEMORY=67108864",
  '-s EXPORTED_FUNCTIONS=["_main", "_doom_main"]',
  '-s EXPORTED_RUNTIME_METHODS=["ccall", "cwrap"]',
  "--preload-file doom1.wad",
  "-O3",
]

try {
  console.log("Compiling Doom to WebAssembly...")
  execSync(
    `emcc ${DOOM_DIR}/linuxdoom-1.10/i_main.c ${DOOM_DIR}/linuxdoom-1.10/*.c \
    -I${DOOM_DIR}/linuxdoom-1.10 \
    ${EMSCRIPTEN_ARGS.join(" ")} \
    -o ${OUTPUT_DIR}/doom.js`,
    { stdio: "inherit" },
  )
  console.log("Compilation successful!")
} catch (error) {
  console.error("Compilation failed:", error)
  process.exit(1)
}


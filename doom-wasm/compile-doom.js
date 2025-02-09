import { execSync } from "child_process"
import fs from "fs"
import path from "path"

const DOOM_REPO = "https://github.com/id-Software/DOOM.git"
const DOOM_DIR = path.join(process.cwd(), "doom-src")
const OUTPUT_DIR = path.join(process.cwd(), "public")

// Clone or update Doom repository
if (!fs.existsSync(DOOM_DIR)) {
  console.log("Cloning Doom repository...")
  execSync(`git clone ${DOOM_REPO} ${DOOM_DIR}`)
} else {
  console.log("Updating Doom repository...")
  execSync("git pull origin master", { cwd: DOOM_DIR })
}

// Compile Doom with Emscripten
const EMSCRIPTEN_ARGS = [
  "-s WASM=1",
  "-s ASYNCIFY",
  "-s ALLOW_MEMORY_GROWTH=1",
  "-s TOTAL_MEMORY=67108864",
  '-s EXPORTED_FUNCTIONS=["_main", "_doom_main", "_set_move_callback", "_set_look_callback", "_set_shoot_callback", "_set_kill_callback", "_set_item_pickup_callback", "_set_secret_found_callback", "_stop_game", "_move_player", "_remote_move_player", "_remote_look_player", "_remote_player_shoot", "_remote_item_pickup", "_remote_secret_found", "_set_volume"]',
  '-s EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "addFunction"]',
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

// Copy the compiled files to the public directory
fs.copyFileSync(path.join(OUTPUT_DIR, "doom.wasm"), path.join(OUTPUT_DIR, "doom.wasm"))
fs.copyFileSync(path.join(OUTPUT_DIR, "doom.js"), path.join(OUTPUT_DIR, "doom.js"))

console.log("Doom compilation and setup complete!")


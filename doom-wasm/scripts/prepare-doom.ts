import fs from "fs"
import path from "path"
import { execSync } from "child_process"

const DOOM_REPO = "https://github.com/id-Software/DOOM.git"
const DOOM_DIR = path.join(__dirname, "..", "doom-src")

if (!fs.existsSync(DOOM_DIR)) {
  console.log("Cloning Doom repository...")
  execSync(`git clone ${DOOM_REPO} ${DOOM_DIR}`)
} else {
  console.log("Doom source code already exists. Updating...")
  execSync("git pull origin master", { cwd: DOOM_DIR })
}

console.log("Doom source code is ready.")


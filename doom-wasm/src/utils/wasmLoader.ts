let doomModule: any = null

export async function initDoom(canvas: HTMLCanvasElement): Promise<any> {
  if (doomModule) return doomModule

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "/doom.js"
    script.async = true
    script.onload = () => {
      const Module = {
        canvas,
        onRuntimeInitialized: () => {
          doomModule = Module
          resolve(Module)
        },
      }
      // @ts-ignore
      window.Module = Module
    }
    script.onerror = () => {
      reject(new Error("Failed to load Doom WASM module"))
    }
    document.body.appendChild(script)
  })
}

export function getDoomModule() {
  return doomModule
}

export function setMoveCallback(callback: () => void) {
  if (doomModule) {
    doomModule.ccall("set_move_callback", null, ["number"], [doomModule.addFunction(callback, "v")])
  }
}

export function setLookCallback(callback: () => void) {
  if (doomModule) {
    doomModule.ccall("set_look_callback", null, ["number"], [doomModule.addFunction(callback, "v")])
  }
}

export function setShootCallback(callback: (hit: boolean) => void) {
  if (doomModule) {
    doomModule.ccall("set_shoot_callback", null, ["number"], [doomModule.addFunction(callback, "vi")])
  }
}

export function setKillCallback(callback: (kills: number) => void) {
  if (doomModule) {
    doomModule.ccall("set_kill_callback", null, ["number"], [doomModule.addFunction(callback, "vi")])
  }
}

export function setItemPickupCallback(callback: () => void) {
  if (doomModule) {
    doomModule.ccall("set_item_pickup_callback", null, ["number"], [doomModule.addFunction(callback, "v")])
  }
}

export function setSecretFoundCallback(callback: () => void) {
  if (doomModule) {
    doomModule.ccall("set_secret_found_callback", null, ["number"], [doomModule.addFunction(callback, "v")])
  }
}

export function setVolume(volume: number) {
  if (doomModule) {
    doomModule.ccall("set_volume", null, ["number"], [volume])
  }
}


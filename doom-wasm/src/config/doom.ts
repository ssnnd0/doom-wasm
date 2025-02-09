export const DOOM_CONFIG = {
  // Default Doom configuration
  SCREEN_WIDTH: 320,
  SCREEN_HEIGHT: 200,
  ASPECT_RATIO: 320 / 200,

  // Game settings
  KILLS_TO_WIN: 3,

  // Controls
  KEYBOARD_CONTROLS: {
    FORWARD: ["KeyW", "ArrowUp"],
    BACKWARD: ["KeyS", "ArrowDown"],
    LEFT: ["KeyA", "ArrowLeft"],
    RIGHT: ["KeyD", "ArrowRight"],
    SHOOT: ["Space"],
    USE: ["KeyE"],
  },

  // Mobile settings
  MOBILE_BREAKPOINT: 768,
  JOYSTICK_SIZE: 128, // pixels
  JOYSTICK_INNER_SIZE: 64, // pixels
}


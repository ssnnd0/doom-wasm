class AudioManager {
  private context: AudioContext
  private sounds: Map<string, AudioBuffer>
  private music: HTMLAudioElement | null
  private gainNode: GainNode

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.sounds = new Map()
    this.music = null
    this.gainNode = this.context.createGain()
    this.gainNode.connect(this.context.destination)
  }

  async loadSound(name: string, url: string): Promise<void> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer)
    this.sounds.set(name, audioBuffer)
  }

  playSound(name: string): void {
    const sound = this.sounds.get(name)
    if (sound) {
      const source = this.context.createBufferSource()
      source.buffer = sound
      source.connect(this.gainNode)
      source.start()
    } else {
      console.warn(`Sound not found: ${name}`)
    }
  }

  playMusic(url: string): void {
    if (this.music) {
      this.music.pause()
    }
    this.music = new Audio(url)
    this.music.loop = true
    this.music.play()
  }

  stopMusic(): void {
    if (this.music) {
      this.music.pause()
      this.music = null
    }
  }

  setVolume(volume: number): void {
    this.gainNode.gain.setValueAtTime(volume, this.context.currentTime)
    if (this.music) {
      this.music.volume = volume
    }
  }
}

export const audioManager = new AudioManager()


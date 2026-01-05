export class TypewriterSound {
  private static pressPool: HTMLAudioElement[] = [];
  private static releasePool: HTMLAudioElement[] = [];
  private static isEnabled = false;
  private static currentPressIndex = 0;
  private static currentReleaseIndex = 0;
  private static readonly POOL_SIZE = 5;
  private static isLoaded = false;
  private static soundsPath = '/sounds/keyboard';

  private static readonly SOUNDS = {
    press: {
      generic: [
        `${this.soundsPath}/press/GENERIC_R0.mp3`,
        `${this.soundsPath}/press/GENERIC_R1.mp3`,
        `${this.soundsPath}/press/GENERIC_R2.mp3`,
        `${this.soundsPath}/press/GENERIC_R3.mp3`,
        `${this.soundsPath}/press/GENERIC_R4.mp3`,
      ],
      space: `${this.soundsPath}/press/SPACE.mp3`,
      enter: `${this.soundsPath}/press/ENTER.mp3`,
      backspace: `${this.soundsPath}/press/BACKSPACE.mp3`,
    },
    release: {
      generic: `${this.soundsPath}/release/GENERIC.mp3`,
      space: `${this.soundsPath}/release/SPACE.mp3`,
      enter: `${this.soundsPath}/release/ENTER.mp3`,
      backspace: `${this.soundsPath}/release/BACKSPACE.mp3`,
    },
  };

  static async preload(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Cria pool de áudios para press
      for (let i = 0; i < this.POOL_SIZE; i++) {
        const audio = new Audio();
        audio.volume = 0.4;
        audio.preload = 'auto';
        this.pressPool.push(audio);
      }

      // Cria pool de áudios para release
      for (let i = 0; i < this.POOL_SIZE; i++) {
        const audio = new Audio();
        audio.volume = 0.25; // Release mais suave
        audio.preload = 'auto';
        this.releasePool.push(audio);
      }

      // Pré-carrega um som de cada
      if (this.pressPool[0]) {
        this.pressPool[0].src = this.SOUNDS.press.generic[0];
        await this.pressPool[0].load();
      }
      if (this.releasePool[0]) {
        this.releasePool[0].src = this.SOUNDS.release.generic;
        await this.releasePool[0].load();
      }

      this.isLoaded = true;
    } catch (error) {
      console.warn('Failed to preload audio:', error);
    }
  }

  static enable(): void {
    this.isEnabled = true;
    this.preload();
  }

  static disable(): void {
    this.isEnabled = false;
  }

  private static playAudio(
    pool: HTMLAudioElement[],
    currentIndex: number,
    soundPath: string | string[]
  ): number {
    try {
      const audio = pool[currentIndex];
      if (!audio) return currentIndex;

      // Se é array, seleciona aleatoriamente
      const selectedSound = Array.isArray(soundPath)
        ? soundPath[Math.floor(Math.random() * soundPath.length)]
        : soundPath;

      if (audio.src !== window.location.origin + selectedSound) {
        audio.src = selectedSound;
      }

      audio.currentTime = 0;
      audio.play().catch(() => {});

      return (currentIndex + 1) % this.POOL_SIZE;
    } catch (error) {
      return currentIndex;
    }
  }

  // Press sounds
  static playPress(): void {
    if (!this.isEnabled) return;
    this.currentPressIndex = this.playAudio(
      this.pressPool,
      this.currentPressIndex,
      this.SOUNDS.press.generic
    );
  }

  static playPressSpace(): void {
    if (!this.isEnabled) return;
    this.currentPressIndex = this.playAudio(
      this.pressPool,
      this.currentPressIndex,
      this.SOUNDS.press.space
    );
  }

  static playPressEnter(): void {
    if (!this.isEnabled) return;
    this.currentPressIndex = this.playAudio(
      this.pressPool,
      this.currentPressIndex,
      this.SOUNDS.press.enter
    );
  }

  static playPressBackspace(): void {
    if (!this.isEnabled) return;
    this.currentPressIndex = this.playAudio(
      this.pressPool,
      this.currentPressIndex,
      this.SOUNDS.press.backspace
    );
  }

  // Release sounds
  static playRelease(): void {
    if (!this.isEnabled) return;
    this.currentReleaseIndex = this.playAudio(
      this.releasePool,
      this.currentReleaseIndex,
      this.SOUNDS.release.generic
    );
  }

  static playReleaseSpace(): void {
    if (!this.isEnabled) return;
    this.currentReleaseIndex = this.playAudio(
      this.releasePool,
      this.currentReleaseIndex,
      this.SOUNDS.release.space
    );
  }

  static playReleaseEnter(): void {
    if (!this.isEnabled) return;
    this.currentReleaseIndex = this.playAudio(
      this.releasePool,
      this.currentReleaseIndex,
      this.SOUNDS.release.enter
    );
  }

  static playReleaseBackspace(): void {
    if (!this.isEnabled) return;
    this.currentReleaseIndex = this.playAudio(
      this.releasePool,
      this.currentReleaseIndex,
      this.SOUNDS.release.backspace
    );
  }
}


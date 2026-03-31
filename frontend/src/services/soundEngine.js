import { DEFAULTS } from '../constants/defaults';

/**
 * Sound Engine - HTML Audio Element
 * Plays ambient sounds instead of Web Audio synthesis
 * Singleton pattern
 */

const AUDIO_SOURCES = {
  'wizard': '/audio/domartistudios-magical-wizard-school-orchestral-fantasy-488126.mp3',
  'nature_melody': '/audio/good_b_music-melody-of-nature-main-6672.mp3',
  'piano': '/audio/good_b_music-simple-piano-melody-9834.mp3',
  'hiphop': '/audio/kontraa-no-sleep-hiphop-music-473847.mp3',
  'epic': '/audio/kornevmusic-epic-478847.mp3',
  'forgiveness': '/audio/stevekaldes-plea-for-forgiveness-stevekaldes-piano-art-ayla-heefner-401168.mp3',
  'cinematic': '/audio/tunetank-inspiring-cinematic-music-409347.mp3'
};

class SoundEngine {
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous'; // Important for CORS
    this.audioElement.loop = true;
    this.audioContext = null;
    this.isPlaying = false;
    this.currentMode = 'silence';
    this.oscillators = [];
    this.bufferSources = [];
    this.filters = [];
    this.startTime = null;
    this.volume = DEFAULTS.audio.volume;
    this.audioElement.volume = this.volume;
  }

  /**
   * Initialize Web Audio Context for alerts
   */
  init() {
    if (this.audioContext) return;

    try {
      const audioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new audioContextClass();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      return false;
    }

    return true;
  }

  /**
   * Continuous Alarm that loops until stopped
   */
  playBreakAlarm() {
    if (!this.audioContext) this.init();
    if (this.alarmInterval) this.stopBreakAlarm();
    
    const playBeep = () => {
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now); // Higher pitch for alarm
      osc.frequency.setValueAtTime(1100, now + 0.1); 

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    };

    // Play immediately and then repeat every 1 second
    playBeep();
    this.alarmInterval = setInterval(playBeep, 1000);
  }

  stopBreakAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  /**
   * Play a sound mode
   */
  play(mode = 'rain') {
    if (!this.audioContext) {
      this.init();
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.currentMode = mode;

    if (mode === 'silence' || mode === 'silent') {
      this.isPlaying = false;
      return;
    }

    const source = AUDIO_SOURCES[mode];
    if (source) {
      this.audioElement.src = source;
      const playPromise = this.audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
        }).catch(err => {
          console.warn('Audio play failed (maybe no interaction):', err);
          this.isPlaying = false;
        });
      }
    }
  }

  /**
   * Stop current sound
   */
  stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    this.audioElement.volume = this.volume;
  }

  /**
   * Auto-mode: switch sounds based on time in session
   */
  playAutoMode(elapsedSeconds, totalSeconds) {
    // simplified for the new modes
    if (this.currentMode !== 'rain') {
      this.play('rain');
    }
  }

  /**
   * Play intervention alert sound
   * Sharp tones to grab attention using Web Audio
   */
  playAlertSound(level = 1) {
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    // Different frequencies for different levels
    const frequencies = {
      1: 800,  // Level 1: medium pitch
      2: 1000, // Level 2: higher pitch
      3: 1200, // Level 3: highest pitch
    };

    osc.frequency.value = frequencies[level] || 800;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5); // Quick fade out

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.isPlaying ? this.currentMode : 'silence';
  }

  /**
   * Check if audio is playing
   */
  isAudioPlaying() {
    return this.isPlaying;
  }

  /**
   * Resume audio context if suspended (browsers require user interaction)
   */
  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    // Pre-warm the HTML audio if possible
    if (this.audioElement.src) {
        // just resume if needed
    }
  }
}

// Export singleton
export const soundEngine = new SoundEngine();

export default {
  soundEngine,
  SoundEngine,
};

let audioContext = null;
let currentNodes = [];
let masterGain = null;

function initAudio() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5; // Default volume
    masterGain.connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function stopCurrentSound() {
  currentNodes.forEach(node => {
    try {
      node.stop();
    } catch (e) { /* ignore */ }
    try {
      node.disconnect();
    } catch (e) { /* ignore */ }
  });
  currentNodes = [];
}

export function setVolume(vol) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, vol));
  }
}

export function playBrownNoise() {
  initAudio();
  stopCurrentSound();

  const bufferSize = audioContext.sampleRate * 2; // 2 seconds
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  // Generate white noise first
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoiseSource = audioContext.createBufferSource();
  whiteNoiseSource.buffer = noiseBuffer;
  whiteNoiseSource.loop = true;

  // Brown noise filter
  const lowpass = audioContext.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 400;
  lowpass.Q.value = 0.7;

  whiteNoiseSource.connect(lowpass);
  lowpass.connect(masterGain);

  whiteNoiseSource.start();
  currentNodes.push(whiteNoiseSource, lowpass);
}

export function playBinauralBeats() {
  initAudio();
  stopCurrentSound();

  const merger = audioContext.createChannelMerger(2);

  const leftOsc = audioContext.createOscillator();
  leftOsc.type = 'sine';
  leftOsc.frequency.value = 200;

  const rightOsc = audioContext.createOscillator();
  rightOsc.type = 'sine';
  rightOsc.frequency.value = 240;

  leftOsc.connect(merger, 0, 0); // left
  rightOsc.connect(merger, 0, 1); // right

  merger.connect(masterGain);

  leftOsc.start();
  rightOsc.start();

  currentNodes.push(leftOsc, rightOsc, merger);
}

export function playLofi() {
  initAudio();
  stopCurrentSound();

  const osc = audioContext.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 110;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  // LFO for gain wobble
  const lfo = audioContext.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1;
  
  const lfoGain = audioContext.createGain();
  lfoGain.gain.value = 0.2; // slight wobble

  // Main gain for this sound
  const soundGain = audioContext.createGain();
  soundGain.gain.value = 0.4; // Base gain offset

  lfo.connect(lfoGain);
  lfoGain.connect(soundGain.gain);

  osc.connect(filter);
  filter.connect(soundGain);
  soundGain.connect(masterGain);

  osc.start();
  lfo.start();

  currentNodes.push(osc, filter, lfo, lfoGain, soundGain);
}

export function stopAudio() {
  stopCurrentSound();
}

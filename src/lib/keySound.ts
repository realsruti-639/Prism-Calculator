type ToneOptions = {
  frequency: number;
  endFrequency?: number;
  duration: number;
  delay?: number;
  type: OscillatorType;
  peak: number;
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!window.AudioContext) return null;
  audioContext ??= new window.AudioContext();
  return audioContext;
}

function playTone({ frequency, endFrequency, duration, delay = 0, type, peak }: ToneOptions): void {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') void context.resume();

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency !== undefined) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

export function playKeyClick(): void {
  playTone({ frequency: 1800, endFrequency: 900, duration: 0.03, type: 'square', peak: 0.04 });
}

export function playChime(): void {
  playTone({ frequency: 880, duration: 0.5, type: 'sine', peak: 0.07 });
  playTone({ frequency: 1320, duration: 0.6, delay: 0.12, type: 'sine', peak: 0.06 });
}

// Sound utility for chess game events
export type SoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'castle' | 'promote' | 'reset';

const AUDIO_CACHE: Partial<Record<SoundType, HTMLAudioElement>> = {};

export function playSound(type: SoundType, enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    let audio = AUDIO_CACHE[type];
    if (!audio) {
      audio = new Audio(`/sounds/${type}.mp3`);
      audio.preload = 'auto';
      AUDIO_CACHE[type] = audio;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {
      // Fallback for browsers with strict audio autoplay policies
      try {
        const fallback = new Audio(`/sounds/${type}.mp3`);
        fallback.play().catch(() => {});
      } catch (e) {}
    });
  } catch (e) {
    console.warn('[Sound] playback error:', e);
  }
}

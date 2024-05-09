
import { textToSpeech } from './api';

let synthesizer: { cancel: () => void; };

export async function speakText(text: string) {
  const audioBuffer = await textToSpeech(text);
  const blob = new Blob([audioBuffer], {type: 'audio/mp3'});
  const audio = new Audio(URL.createObjectURL(blob));
  // audio.play();
  return audio;
}

export function stopSpeaking() {
  if (synthesizer) {
    synthesizer.cancel();
  }
}

import audioFile from "../../../assets/chatAudio.mp3";

const chatAudio = new Audio(audioFile);
chatAudio.volume = 0.5;

export const chatAudioPlay = () => {
  chatAudio.currentTime = 0;

  chatAudio.play().catch((err) => {
    console.warn("Não foi possível tocar o áudio:", err);
  });
};

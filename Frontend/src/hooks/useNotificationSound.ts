import { useEffect, useRef } from "react";

export function useNotificationSound(enable: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/Notification.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.5; // Set volume to 50%

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = () => {
    if (!enable || !audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((error) => {
      console.error("Failed to play notification sound:", error);
    });
  };

  return {playSound};
}

export function useTTS({ engine = 'openai', voice, speed = 1 }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState(null);
  const [error, setError] = React.useState(null);
  const audioRef = React.useRef(null);

  const synthesize = async (text) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tts/${engine}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, speed })
      });
      const data = await res.json();
      if (data.success) {
        setAudioUrl(data.data.url);
      } else {
        setError(data.error?.message || 'Synthesis failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const download = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'audio.wav';
      a.click();
    }
  };

  return {
    synthesize,
    play,
    pause,
    stop,
    download,
    isLoading,
    isPlaying,
    audioUrl,
    error,
    audioRef
  };
}

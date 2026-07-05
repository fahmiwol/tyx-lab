import React, { useState } from 'react';

export default function TTSModule({ onGenerated }) {
  const [text, setText] = useState('');
  const [engine, setEngine] = useState('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const synthesize = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tts/${engine}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, engine })
      });
      const data = await response.json();
      if (data.success) {
        setAudioUrl(data.data.url);
        onGenerated?.(data.data.url, text, engine);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows="4" className="w-full mb-2" />
      <select value={engine} onChange={(e) => setEngine(e.target.value)} className="mb-2">
        <option value="openai">OpenAI</option>
        <option value="coqui">Coqui</option>
        <option value="web-speech">Web Speech</option>
      </select>
      <button onClick={synthesize} disabled={isLoading}>{isLoading ? 'Generating...' : 'Synthesize'}</button>
      {audioUrl && <audio src={audioUrl} controls className="mt-2" />}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import music1 from '../assets/1.mp3';
import music2 from '../assets/2.mp3';

export default function BackgroundMusic() {
  const { sinMode } = useTheme();
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // Create audio element once
  useEffect(() => {
    audioRef.current = new Audio(sinMode ? music2 : music1);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Switch track when sinMode changes
  useEffect(() => {
    if (!audioRef.current || !started) return;
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.pause();
    audioRef.current.src = sinMode ? music2 : music1;
    audioRef.current.load();
    if (wasPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [sinMode]);

  // Apply mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const handleToggle = () => {
    if (!started) {
      setStarted(true);
      audioRef.current.play().catch(() => {});
    } else {
      setMuted(m => !m);
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        position:'fixed', bottom:72, right:16, zIndex:998,
        width:36, height:36, borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center',
        border:'none', cursor:'pointer',
        backdropFilter:'blur(8px)',
        background: sinMode ? 'rgba(140,0,0,0.6)' : 'rgba(26,86,219,0.15)',
        boxShadow: sinMode ? '0 2px 12px rgba(200,0,0,0.3)' : '0 2px 12px rgba(26,86,219,0.2)',
      }}
      title={started && !muted ? 'Mute music' : 'Play music'}>
      {started && !muted
        ? <FiVolume2 size={16} color={sinMode ? '#ff6666' : '#1a56db'} />
        : <FiVolumeX size={16} color={sinMode ? '#ff6666' : '#1a56db'} />}
    </button>
  );
}

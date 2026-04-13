import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useStory } from '../context/StoryContext';
import { STORY_EVENTS } from '../data/storyScripts';

// Character SVG imports
import AaravU from '../assets/AaravU.svg';
import AaravS from '../assets/AaravS.svg';
import MiraU from '../assets/MiraU.svg';
import MiraS from '../assets/MiraS.svg';
import StrangerImg from '../assets/Stranger.svg';

function getCharImg(name, sinMode) {
  if (name === 'Stranger') return StrangerImg;
  if (name === 'Aarav') return sinMode ? AaravS : AaravU;
  if (name === 'Mira')  return sinMode ? MiraS  : MiraU;
  return AaravU;
}

function getCharSide(name) {
  if (name === 'Mira' || name === 'Stranger') return 'right';
  return 'left';
}

export default function StoryOverlay() {
  const { sinMode } = useTheme();
  const { pendingEvent, setPendingEvent, markSeen } = useStory();
  const [visible, setVisible] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);   // which dialogue block
  const [lineIdx, setLineIdx] = useState(0);    // which line inside block
  const [charIn, setCharIn] = useState(false);
  const [bubbleIn, setBubbleIn] = useState(false);

  useEffect(() => {
    if (!pendingEvent) return;
    const script = STORY_EVENTS[pendingEvent.eventId];
    if (!script) {
      pendingEvent.onComplete?.();
      setPendingEvent(null);
      return;
    }
    setSequence(script);
    setStepIdx(0);
    setLineIdx(0);
    setVisible(true);
    setCharIn(false);
    setBubbleIn(false);
    // Animate character in
    setTimeout(() => setCharIn(true), 80);
    setTimeout(() => setBubbleIn(true), 400);
  }, [pendingEvent]);

  const currentStep = sequence[stepIdx];
  const currentLine = currentStep?.lines[lineIdx];
  const isLastLine = currentStep && lineIdx === currentStep.lines.length - 1;
  const isLastStep = stepIdx === sequence.length - 1;

  const handleNext = async () => {
    if (!isLastLine) {
      // Next line in same block
      setBubbleIn(false);
      setTimeout(() => { setLineIdx(l => l + 1); setBubbleIn(true); }, 200);
    } else if (!isLastStep) {
      // Animate character out, then bring next character in
      setBubbleIn(false);
      setCharIn(false);
      setTimeout(() => {
        setStepIdx(s => s + 1);
        setLineIdx(0);
        setCharIn(false);
        setTimeout(() => { setCharIn(true); }, 100);
        setTimeout(() => { setBubbleIn(true); }, 420);
      }, 350);
    } else {
      // End of story
      setBubbleIn(false);
      setCharIn(false);
      await markSeen(pendingEvent.eventId);
      setTimeout(() => {
        setVisible(false);
        const cb = pendingEvent.onComplete;
        setPendingEvent(null);
        cb?.();
      }, 400);
    }
  };

  if (!visible || !currentStep) return null;

  const side = getCharSide(currentStep.character);
  const imgSrc = getCharImg(currentStep.character, sinMode);
  const isLeft = side === 'left';

  // Bubble position
  const bubbleStyle = isLeft
    ? { left: '90px', right: '16px', bottom: '170px' }
    : { right: '90px', left: '16px', bottom: '170px' };

  const charStyle = {
    position: 'fixed',
    bottom: 60,
    [isLeft ? 'left' : 'right']: charIn ? 0 : (isLeft ? -120 : -120),
    width: 110,
    height: 'auto',
    zIndex: 9998,
    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    filter: sinMode ? 'drop-shadow(0 0 12px rgba(200,0,0,0.5))' : 'drop-shadow(0 4px 12px rgba(26,86,219,0.25))',
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9997, pointerEvents:'none' }}>
      {/* Dim overlay — only pointer-events on the Next button */}
      <div style={{
        position:'absolute', inset:0,
        background: 'rgba(0,0,0,0.45)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'auto'
      }} />

      {/* Character */}
      <img src={imgSrc} alt={currentStep.character} style={charStyle} />

      {/* Speech bubble */}
      <div style={{
        position:'fixed',
        ...bubbleStyle,
        pointerEvents:'auto',
        opacity: bubbleIn ? 1 : 0,
        transform: bubbleIn ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
        transition: 'all 0.25s ease',
        zIndex: 9999,
      }}>
        <div style={{
          background: sinMode ? '#1a0000' : 'white',
          border: sinMode ? '2px solid #cc0000' : '2px solid #1a56db',
          borderRadius: 20,
          padding: '14px 16px 12px',
          boxShadow: sinMode
            ? '0 8px 32px rgba(200,0,0,0.3)'
            : '0 8px 32px rgba(26,86,219,0.2)',
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {/* Character name */}
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: sinMode ? '#ff6666' : '#1a56db',
            textTransform: 'uppercase',
            letterSpacing: 1,
            margin: 0,
          }}>
            {currentStep.character}
          </p>

          {/* Dialogue line */}
          <p style={{
            fontSize: 15,
            fontWeight: 500,
            color: sinMode ? '#f5f5f5' : '#0d1b4b',
            lineHeight: 1.5,
            margin: 0,
            minHeight: 44,
          }}>
            {currentLine}
          </p>

          {/* Bubble tail */}
          <div style={{
            position:'absolute',
            bottom: -10,
            [isLeft ? 'left' : 'right']: 24,
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: sinMode ? '10px solid #cc0000' : '10px solid #1a56db',
          }} />

          {/* Next button */}
          <button
            onClick={handleNext}
            style={{
              alignSelf: 'flex-end',
              padding: '6px 18px',
              borderRadius: 20,
              border: 'none',
              background: sinMode
                ? 'linear-gradient(135deg,#cc0000,#ff3333)'
                : 'linear-gradient(135deg,#1a56db,#3b7ef8)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: sinMode ? '0 4px 12px rgba(200,0,0,0.4)' : '0 4px 12px rgba(26,86,219,0.3)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.target.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform='translateY(0)'}
          >
            {isLastLine && isLastStep ? 'Got it' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const dialogues = {
  home:    { normal: "Ready to crush today's goals?", sin: "Rise up, warrior. The city is yours." },
  quest:   { normal: "Complete your quests to level up!", sin: "Every mission brings you closer to power." },
  finish:  { normal: "Awesome work today! 🎉", sin: "You have conquered. Rest, then rise again." },
  quit:    { normal: "Don't give up!", sin: "You have become soft and weak {username}. Get gud." },
};

export default function CharacterGuide({ event, sinMode, username }) {
  const [visible, setVisible] = useState(true);
  const text = dialogues[event]?.[sinMode ? 'sin' : 'normal']
    ?.replace('{username}', username || 'warrior');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [event]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className={`fixed bottom-20 left-4 flex items-end gap-3 z-40`}>
          {/* Character avatar — swap src based on sinMode */}
          <div className={`w-16 h-16 rounded-full border-2 overflow-hidden
            ${sinMode ? 'border-cyan-400' : 'border-indigo-400'}`}>
            <img src={sinMode ? '/character-sin.png' : '/character-normal.png'}
              alt="guide" className="w-full h-full object-cover" />
          </div>
          {/* Speech bubble */}
          <div className={`max-w-48 rounded-2xl px-3 py-2 text-sm
            ${sinMode ? 'bg-gray-900 text-cyan-300 border border-cyan-800' : 'bg-white shadow text-gray-800'}`}>
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
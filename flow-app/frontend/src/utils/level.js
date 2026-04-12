export function getLevel(xp) {
  if (xp < 500) return 1;
  if (xp < 1500) return 2;
  const extra = xp - 1500;
  return 3 + Math.floor(extra / 1000);
}

export function xpToNextLevel(xp) {
  const level = getLevel(xp);
  if (level === 1) return { current: xp, needed: 500, label: 'Level 2' };
  if (level === 2) return { current: xp - 500, needed: 1000, label: 'Level 3' };
  const base = 1500 + (level - 3) * 1000;
  return { current: xp - base, needed: 1000, label: `Level ${level + 1}` };
}

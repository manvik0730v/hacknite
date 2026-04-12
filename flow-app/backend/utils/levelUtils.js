function getLevel(xp) {
  if (xp < 500) return 1;
  if (xp < 1500) return 2;
  const extra = xp - 1500;
  return 3 + Math.floor(extra / 1000);
}
module.exports = { getLevel };

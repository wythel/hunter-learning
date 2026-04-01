export function calculateStars(correct, wrong) {
  const total = correct + wrong;
  const accuracy = total > 0 ? correct / total : 0;
  if (wrong === 0)       return 3;
  if (wrong === 1)       return 3;
  if (accuracy >= 0.7)   return 2;
  if (accuracy >= 0.4)   return 1;
  return 0;
}

export function getResultTitle(stars, completed = true) {
  if (!completed) return '勇者倒下了...';
  return ['辛苦了！', '繼續努力！', '非常棒！', '完美通關！'][stars];
}

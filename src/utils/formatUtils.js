// format a number in fixed-point notation.
export const formatScore = (score) => {
  if (score === null || score === undefined) return "--";
  if (typeof score !== 'number') return score;
  return score.toFixed(2);
};
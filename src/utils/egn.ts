export function validateEGN(egn: string): boolean {
  if (!/^\d{10}$/.test(egn)) return false;
  const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6, 1];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(egn[i]) * weights[i];
  }
  const rem = sum % 11;
  const checkDigit = rem === 10 ? 0 : rem;
  return checkDigit === parseInt(egn[9]);
}

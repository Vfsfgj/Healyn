export function formatFCFA(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 FCFA';
  return `${Math.round(num).toLocaleString('fr-FR')} FCFA`;
}

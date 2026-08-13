/**
 * Internal XION ID Generator
 * Format: LL99-LL99 (e.g., XD78-GT99, AB12-CD34)
 * 
 * IMPORTANT: ID XION is an internal traceability & moderation identifier.
 * As per specification, it is stored in database records but MUST NEVER
 * be exposed or displayed in the user interface.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';

function getRandomChar(set: string): string {
  return set.charAt(Math.floor(Math.random() * set.length));
}

/**
 * Generates an internal ID XION matching the format LL99-LL99
 * @example "XD78-GT99", "VX12-QP84"
 */
export function generateIDXion(): string {
  const l1 = getRandomChar(LETTERS);
  const l2 = getRandomChar(LETTERS);
  const n1 = getRandomChar(NUMBERS);
  const n2 = getRandomChar(NUMBERS);

  const l3 = getRandomChar(LETTERS);
  const l4 = getRandomChar(LETTERS);
  const n3 = getRandomChar(NUMBERS);
  const n4 = getRandomChar(NUMBERS);

  return `${l1}${l2}${n1}${n2}-${l3}${l4}${n3}${n4}`;
}

/**
 * Validates whether a string conforms to the ID XION format (LL99-LL99)
 */
export function isValidIDXion(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const regex = /^[A-Z]{2}\d{2}-[A-Z]{2}\d{2}$/;
  return regex.test(id);
}

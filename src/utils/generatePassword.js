const SETS = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  upperAll: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz',
  lowerAll: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '23456789',
  numbersAll: '0123456789',
  symbols: '!@#$%^&*_-+=?',
};

function pickCharset(options) {
  let pool = '';
  const required = [];

  if (options.uppercase !== false) {
    const set = options.excludeAmbiguous === false ? SETS.upperAll : SETS.upper;
    pool += set;
    required.push(set);
  }
  if (options.lowercase !== false) {
    const set = options.excludeAmbiguous === false ? SETS.lowerAll : SETS.lower;
    pool += set;
    required.push(set);
  }
  if (options.numbers !== false) {
    const set = options.excludeAmbiguous === false ? SETS.numbersAll : SETS.numbers;
    pool += set;
    required.push(set);
  }
  if (options.symbols) {
    pool += SETS.symbols;
    required.push(SETS.symbols);
  }

  return { pool, required };
}

function randomIndex(max) {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % max;
}

function shuffle(list) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1);
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

export function generatePassword(options = {}) {
  const length = Math.min(64, Math.max(8, Number(options.length) || 16));
  const { pool, required } = pickCharset(options);
  if (!pool) return '';

  const chars = required.map((set) => set[randomIndex(set.length)]);
  while (chars.length < length) {
    chars.push(pool[randomIndex(pool.length)]);
  }

  return shuffle(chars).join('');
}

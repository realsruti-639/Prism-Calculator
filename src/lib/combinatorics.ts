const MAX_OPERAND = 10000;

const MATH_INPUT_ERROR = 'nPr and nCr need whole numbers with r no greater than n';

function toBigIntOperands(n: number, r: number): [bigint, bigint] {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) throw new Error(MATH_INPUT_ERROR);
  if (n > MAX_OPERAND) throw new Error('Number too large');
  return [BigInt(n), BigInt(r)];
}

export function permutations(n: number, r: number): number {
  const [total, picks] = toBigIntOperands(n, r);
  let result = 1n;
  for (let step = 0n; step < picks; step += 1n) result *= total - step;
  return Number(result);
}

export function combinations(n: number, r: number): number {
  const [total, picks] = toBigIntOperands(n, r);
  const others = total - picks;
  let result = 1n;
  for (let step = 1n; step <= picks; step += 1n) result = (result * (others + step)) / step;
  return Number(result);
}

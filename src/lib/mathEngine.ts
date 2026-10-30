import { combinations, permutations } from '@/lib/combinatorics';
import { matchRadixDigits, parseRadixDigits, toBaseDigits } from '@/lib/radix';

export type AngleMode = 'rad' | 'deg';

export type EvaluationContext = {
  angle: AngleMode;
  ans: number;
  base: number;
  x?: number;
  y?: number;
};

type Operator = '+' | '-' | '*' | '/' | '^' | '!' | '%' | 'P' | 'C';

const FUNCTION_NAMES = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'log2', 'sqrt', 'cbrt', 'abs'] as const;

type FunctionName = (typeof FUNCTION_NAMES)[number];

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'ans' }
  | { kind: 'variable'; name: 'x' | 'y' }
  | { kind: 'operator'; value: Operator }
  | { kind: 'open' }
  | { kind: 'close' }
  | { kind: 'function'; name: FunctionName };

const SYNTAX_ERROR = 'Syntax error';
const MATH_ERROR = 'Math error';
const DIVIDE_BY_ZERO_ERROR = 'Cannot divide by zero';

const SYMBOL_FUNCTIONS: Record<string, FunctionName> = { '√': 'sqrt', '∛': 'cbrt' };

const SYMBOL_OPERATORS: Record<string, Operator> = {
  '+': '+',
  '-': '-',
  '−': '-',
  '*': '*',
  '×': '*',
  '/': '/',
  '÷': '/',
  '^': '^',
  '!': '!',
  '%': '%',
};

const NUMBER_PATTERN = /^(\d+\.?\d*|\.\d+)/;
const WORD_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*/;

const NOISE_THRESHOLD = 1e-12;
const MAX_FACTORIAL = 170;

export function toPlainDecimal(value: number): string {
  return value.toLocaleString('en-US', { useGrouping: false, maximumSignificantDigits: 15 });
}

export function toInputLiteral(value: number, base: number): string {
  const digits = base === 10 ? toPlainDecimal(value) : toBaseDigits(value, base);
  return `(${digits})`;
}

export function closeOpenParentheses(expression: string): string {
  const unclosed = expression.split('(').length - expression.split(')').length;
  return expression + ')'.repeat(Math.max(0, unclosed));
}

export function evaluateExpression(expression: string, context: EvaluationContext): number {
  if (expression.trim() === '') throw new Error(SYNTAX_ERROR);
  const value = parseTokens(tokenize(closeOpenParentheses(expression), context.base), context);
  if (!Number.isFinite(value)) throw new Error(MATH_ERROR);
  return value;
}

export function formatNumber(value: number): string {
  if (value === 0) return '0';
  const rounded = Number(value.toPrecision(10));
  const magnitude = Math.abs(rounded);
  if (magnitude >= 1e12 || magnitude < 1e-6) {
    return rounded.toExponential().replace('e+', 'e');
  }
  return String(rounded);
}

function endsValue(token: Token): boolean {
  return (
    token.kind === 'number' ||
    token.kind === 'ans' ||
    token.kind === 'variable' ||
    token.kind === 'close' ||
    (token.kind === 'operator' && (token.value === '!' || token.value === '%'))
  );
}

function startsValue(token: Token): boolean {
  return token.kind === 'number' || token.kind === 'ans' || token.kind === 'variable' || token.kind === 'open' || token.kind === 'function';
}

function readWord(word: string): Token {
  if (word === 'e') return { kind: 'number', value: Math.E };
  if (word === 'pi') return { kind: 'number', value: Math.PI };
  if (word === 'Ans') return { kind: 'ans' };
  if (word === 'x' || word === 'y') return { kind: 'variable', name: word };
  if (word === 'nPr') return { kind: 'operator', value: 'P' };
  if (word === 'nCr') return { kind: 'operator', value: 'C' };
  const name = FUNCTION_NAMES.find((candidate) => candidate === word);
  if (name) return { kind: 'function', name };
  throw new Error(SYNTAX_ERROR);
}

function readToken(rest: string, base: number): { token: Token; length: number } {
  const char = rest[0];

  if (base !== 10) {
    const digits = matchRadixDigits(rest, base);
    if (digits) return { token: { kind: 'number', value: parseRadixDigits(digits, base) }, length: digits.length };
    if (/^[0-9.]/.test(rest)) throw new Error(SYNTAX_ERROR);
  } else {
    const number = NUMBER_PATTERN.exec(rest);
    if (number) return { token: { kind: 'number', value: Number(number[0]) }, length: number[0].length };
  }

  const word = WORD_PATTERN.exec(rest);
  if (word) return { token: readWord(word[0]), length: word[0].length };

  if (char === 'π') return { token: { kind: 'number', value: Math.PI }, length: 1 };
  if (char in SYMBOL_FUNCTIONS) return { token: { kind: 'function', name: SYMBOL_FUNCTIONS[char] }, length: 1 };
  if (char === '(') return { token: { kind: 'open' }, length: 1 };
  if (char === ')') return { token: { kind: 'close' }, length: 1 };
  if (char in SYMBOL_OPERATORS) return { token: { kind: 'operator', value: SYMBOL_OPERATORS[char] }, length: 1 };

  throw new Error(SYNTAX_ERROR);
}

function tokenize(input: string, base: number): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < input.length) {
    if (/\s/.test(input[position])) {
      position += 1;
      continue;
    }

    const { token, length } = readToken(input.slice(position), base);
    const previous = tokens[tokens.length - 1];
    if (previous && endsValue(previous) && startsValue(token)) {
      tokens.push({ kind: 'operator', value: '*' });
    }
    tokens.push(token);
    position += length;
  }

  return tokens;
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > MAX_FACTORIAL) throw new Error(MATH_ERROR);
  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) result *= factor;
  return result;
}

function withoutNoise(value: number): number {
  return Math.abs(value) < NOISE_THRESHOLD ? 0 : value;
}

function applyFunction(name: FunctionName, argument: number, angle: AngleMode): number {
  const toRadians = (value: number) => (angle === 'deg' ? (value * Math.PI) / 180 : value);
  const fromRadians = (value: number) => (angle === 'deg' ? (value * 180) / Math.PI : value);

  switch (name) {
    case 'sin':
      return withoutNoise(Math.sin(toRadians(argument)));
    case 'cos':
      return withoutNoise(Math.cos(toRadians(argument)));
    case 'tan':
      return withoutNoise(Math.tan(toRadians(argument)));
    case 'asin':
      return fromRadians(Math.asin(argument));
    case 'acos':
      return fromRadians(Math.acos(argument));
    case 'atan':
      return fromRadians(Math.atan(argument));
    case 'ln':
      return Math.log(argument);
    case 'log':
      return Math.log10(argument);
    case 'log2':
      return Math.log2(argument);
    case 'sqrt':
      return Math.sqrt(argument);
    case 'cbrt':
      return Math.cbrt(argument);
    case 'abs':
      return Math.abs(argument);
  }
}

function parseTokens(tokens: Token[], context: EvaluationContext): number {
  let position = 0;

  const isOperator = (operator: Operator) => {
    const token = tokens[position];
    return token?.kind === 'operator' && token.value === operator;
  };

  const expectClose = () => {
    if (tokens[position]?.kind !== 'close') throw new Error(SYNTAX_ERROR);
    position += 1;
  };

  function parseExpression(): number {
    let value = parseTerm();
    while (isOperator('+') || isOperator('-')) {
      const subtract = isOperator('-');
      position += 1;
      const right = parseTerm();
      value = subtract ? value - right : value + right;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseUnary();
    while (isOperator('*') || isOperator('/')) {
      const divide = isOperator('/');
      position += 1;
      const right = parseUnary();
      if (divide && right === 0) throw new Error(DIVIDE_BY_ZERO_ERROR);
      value = divide ? value / right : value * right;
    }
    return value;
  }

  function parseUnary(): number {
    if (isOperator('-')) {
      position += 1;
      return -parseUnary();
    }
    if (isOperator('+')) {
      position += 1;
      return parseUnary();
    }
    return parsePower();
  }

  function parsePower(): number {
    let value = parsePostfix();
    if (isOperator('P') || isOperator('C')) {
      const permute = isOperator('P');
      position += 1;
      const picks = parsePostfix();
      value = permute ? permutations(value, picks) : combinations(value, picks);
    }
    if (isOperator('^')) {
      position += 1;
      return value ** parseUnary();
    }
    return value;
  }

  function parsePostfix(): number {
    let value = parsePrimary();
    for (;;) {
      if (isOperator('!')) {
        position += 1;
        value = factorial(value);
      } else if (isOperator('%')) {
        position += 1;
        value /= 100;
      } else {
        return value;
      }
    }
  }

  function parsePrimary(): number {
    const token = tokens[position];
    if (!token) throw new Error(SYNTAX_ERROR);

    position += 1;
    switch (token.kind) {
      case 'number':
        return token.value;
      case 'ans':
        return context.ans;
      case 'variable': {
        const value = token.name === 'x' ? context.x : context.y;
        if (value === undefined) throw new Error(SYNTAX_ERROR);
        return value;
      }
      case 'open': {
        const value = parseExpression();
        expectClose();
        return value;
      }
      case 'function':
        return applyFunction(token.name, parsePrimary(), context.angle);
      default:
        throw new Error(SYNTAX_ERROR);
    }
  }

  const value = parseExpression();
  if (position !== tokens.length) throw new Error(SYNTAX_ERROR);
  return value;
}

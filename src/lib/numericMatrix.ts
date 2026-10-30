export type NumericMatrix = number[][];

export function multiply(left: NumericMatrix, right: NumericMatrix): NumericMatrix {
  return left.map((row) =>
    right[0].map((_, col) => row.reduce((sum, value, index) => sum + value * right[index][col], 0)),
  );
}

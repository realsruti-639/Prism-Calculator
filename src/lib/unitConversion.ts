export type UnitCategoryId = 'length' | 'temperature' | 'mass';

export type Unit = { id: string; label: string };

export type UnitCategory = { id: UnitCategoryId; label: string; units: Unit[] };

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    label: 'Length',
    units: [
      { id: 'm', label: 'Meters (m)' },
      { id: 'km', label: 'Kilometers (km)' },
      { id: 'ft', label: 'Feet (ft)' },
      { id: 'mi', label: 'Miles (mi)' },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: [
      { id: 'C', label: 'Celsius (°C)' },
      { id: 'F', label: 'Fahrenheit (°F)' },
      { id: 'K', label: 'Kelvin (K)' },
    ],
  },
  {
    id: 'mass',
    label: 'Mass',
    units: [
      { id: 'kg', label: 'Kilograms (kg)' },
      { id: 'g', label: 'Grams (g)' },
      { id: 'lb', label: 'Pounds (lb)' },
    ],
  },
];

const METERS_PER_UNIT: Record<string, number> = { m: 1, km: 1000, ft: 0.3048, mi: 1609.344 };
const KILOGRAMS_PER_UNIT: Record<string, number> = { kg: 1, g: 0.001, lb: 0.45359237 };

const TO_KELVIN: Record<string, (value: number) => number> = {
  C: (value) => value + 273.15,
  F: (value) => ((value - 32) * 5) / 9 + 273.15,
  K: (value) => value,
};

const FROM_KELVIN: Record<string, (kelvin: number) => number> = {
  C: (kelvin) => kelvin - 273.15,
  F: (kelvin) => ((kelvin - 273.15) * 9) / 5 + 32,
  K: (kelvin) => kelvin,
};

const LINEAR_FACTORS: Record<Exclude<UnitCategoryId, 'temperature'>, Record<string, number>> = {
  length: METERS_PER_UNIT,
  mass: KILOGRAMS_PER_UNIT,
};

const ABSOLUTE_ZERO_ERROR = 'Below absolute zero';

export function convertUnits(category: UnitCategoryId, from: string, to: string, value: number): number {
  if (category === 'temperature') {
    const kelvin = TO_KELVIN[from](value);
    if (kelvin < 0) throw new Error(ABSOLUTE_ZERO_ERROR);
    return FROM_KELVIN[to](kelvin);
  }
  const factors = LINEAR_FACTORS[category];
  return (value * factors[from]) / factors[to];
}

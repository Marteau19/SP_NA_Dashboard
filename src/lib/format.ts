import type { Currency } from "../data/seedData";

// Mock FX rate for the prototype. One display currency at a time, toggled in
// the top bar. All seed amounts are normalized to the chosen display currency.
export const USD_PER_CAD = 0.73;
export const CAD_PER_USD = 1 / USD_PER_CAD;

// Convert a native amount into the chosen display currency.
export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  if (from === "CAD" && to === "USD") return amount * USD_PER_CAD;
  return amount * CAD_PER_USD; // USD -> CAD
}

const SYMBOL: Record<Currency, string> = { CAD: "$", USD: "$" };

// Format a (already converted) amount as $X.XM / $XXXK style.
export function money(amount: number, currency: Currency = "CAD"): string {
  const s = SYMBOL[currency];
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${s}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${s}${Math.round(abs / 1_000)}K`;
  return `${sign}${s}${Math.round(abs)}`;
}

// Compact label including the currency code, e.g. "$2.4M CAD".
export function moneyWithCode(amount: number, currency: Currency): string {
  return `${money(amount, currency)} ${currency}`;
}

export function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function num(value: number): string {
  return value.toLocaleString("en-US");
}

export function perKm(value: number, currency: Currency = "CAD"): string {
  return `${SYMBOL[currency]}${value.toFixed(1)}/km`;
}

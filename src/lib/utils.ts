import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes while avoiding specificity conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format USD cost with 6 decimal places, show as $0.00 if zero
 */
export function formatCost(cents: number | undefined | null): string {
  if (cents === undefined || cents === null || cents === 0) {
    return "$0.00";
  }
  const dollars = cents / 100;
  return `$${dollars.toFixed(6)}`;
}

/**
 * Format latency in milliseconds or seconds
 */
export function formatLatency(ms: number | undefined | null): string {
  if (ms === undefined || ms === null) {
    return "—";
  }
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format token count with commas
 */
export function formatTokens(count: number | undefined | null): string {
  if (count === undefined || count === null) {
    return "—";
  }
  return count.toLocaleString();
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, maxLength - 3)}...`;
}

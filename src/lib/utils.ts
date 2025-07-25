import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function updateSettings<T extends Record<string, any>>(
  prev: T,
  category: keyof T,
  key: string,
  value: any
): T {
  return {
    ...prev,
    [category]: {
      ...prev[category],
      [key]: value,
    },
  };
}

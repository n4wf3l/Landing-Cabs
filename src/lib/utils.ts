import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number, currency: 'EUR' = 'EUR'): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

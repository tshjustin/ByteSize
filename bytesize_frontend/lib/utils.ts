import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePaperContextId(paperId: string, context: 'recent' | 'highly-cited'): string {
  return `${context}-${paperId}`;
}
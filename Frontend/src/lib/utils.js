import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format date from YYYY-MM format to "Month Year" format
 * @param {string} dateString - Date string in YYYY-MM format
 * @returns {string} Formatted date like "July 2024"
 */
export function formatMonthYear(dateString) {
  if (!dateString) return '';
  
  const [year, month] = dateString.split('-');
  const date = new Date(year, month - 1);
  
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
}

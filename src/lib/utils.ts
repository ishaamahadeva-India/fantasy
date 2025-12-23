import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse dates from CSV with support for multiple formats
 * Supports: YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY, DD/MM/YYYY, MM/DD/YYYY, ISO 8601
 * 
 * @param dateString - The date string to parse
 * @param fieldName - Name of the field (for error messages)
 * @param required - Whether the field is required
 * @returns A valid Date object
 * @throws Error if date is invalid or required but missing
 */
export function parseCSVDate(
  dateString: string | undefined,
  fieldName: string,
  required: boolean = false
): Date {
  if (!dateString || dateString.trim() === '') {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return new Date();
  }
  
  const trimmed = dateString.trim();
  
  // Try parsing directly first (works for ISO 8601 and YYYY-MM-DD)
  let date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try parsing DD-MM-YYYY or MM-DD-YYYY format (e.g., "18-01-2026" or "01-18-2026")
  const dashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, part1, part2, year] = dashMatch;
    const num1 = parseInt(part1);
    const num2 = parseInt(part2);
    
    // If first part > 12, it must be DD-MM-YYYY
    if (num1 > 12) {
      date = new Date(parseInt(year), num2 - 1, num1);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // If second part > 12, it must be MM-DD-YYYY
    else if (num2 > 12) {
      date = new Date(parseInt(year), num1 - 1, num2);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Both <= 12, try DD-MM-YYYY first (international format)
    else {
      date = new Date(parseInt(year), num2 - 1, num1);
      if (!isNaN(date.getTime())) {
        return date;
      }
      // If that fails, try MM-DD-YYYY
      date = new Date(parseInt(year), num1 - 1, num2);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  // Try parsing DD/MM/YYYY or MM/DD/YYYY format (e.g., "18/01/2026" or "01/18/2026")
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, part1, part2, year] = slashMatch;
    const num1 = parseInt(part1);
    const num2 = parseInt(part2);
    
    // If first part > 12, it must be DD/MM/YYYY
    if (num1 > 12) {
      date = new Date(parseInt(year), num2 - 1, num1);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // If second part > 12, it must be MM/DD/YYYY
    else if (num2 > 12) {
      date = new Date(parseInt(year), num1 - 1, num2);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Both <= 12, try DD/MM/YYYY first (international format)
    else {
      date = new Date(parseInt(year), num2 - 1, num1);
      if (!isNaN(date.getTime())) {
        return date;
      }
      // If that fails, try MM/DD/YYYY
      date = new Date(parseInt(year), num1 - 1, num2);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  // If all parsing attempts failed, throw an error
  throw new Error(`Invalid ${fieldName} format: "${dateString}". Supported formats: YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY, DD/MM/YYYY, MM/DD/YYYY, or ISO 8601`);
}
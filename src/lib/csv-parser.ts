import { categorizeTransaction } from "./categories";

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  merchant?: string;
}

interface CSVRow {
  [key: string]: string;
}

// Common column name mappings
const DATE_COLUMNS = ["date", "transaction date", "txn date", "posting date", "value date", "trans date"];
const DESCRIPTION_COLUMNS = ["description", "narration", "particulars", "details", "transaction details", "remarks", "memo"];
const AMOUNT_COLUMNS = ["amount", "transaction amount", "txn amount", "value", "sum"];
const CREDIT_COLUMNS = ["credit", "deposit", "cr", "credit amount"];
const DEBIT_COLUMNS = ["debit", "withdrawal", "dr", "debit amount"];
const TYPE_COLUMNS = ["type", "transaction type", "txn type", "dr/cr"];

function findColumn(headers: string[], possibleNames: string[]): string | null {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  for (const name of possibleNames) {
    const index = lowerHeaders.indexOf(name.toLowerCase());
    if (index !== -1) {
      return headers[index];
    }
  }
  
  // Partial match
  for (const name of possibleNames) {
    const index = lowerHeaders.findIndex(h => h.includes(name.toLowerCase()));
    if (index !== -1) {
      return headers[index];
    }
  }
  
  return null;
}

function parseDate(dateStr: string): string {
  // Try various date formats
  const cleanDate = dateStr.trim();
  
  // DD/MM/YYYY or DD-MM-YYYY
  let match = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // YYYY-MM-DD
  match = cleanDate.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // MM/DD/YYYY
  match = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try native Date parsing as fallback
  const parsed = new Date(cleanDate);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  
  // Return today's date as last resort
  return new Date().toISOString().split('T')[0];
}

function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = amountStr
    .replace(/[₹$€£¥,\s]/g, '')
    .replace(/[()]/g, '') // Handle negative in parentheses
    .trim();
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount);
}

function extractMerchant(description: string): string | undefined {
  // Extract first meaningful word/phrase as merchant
  const words = description.split(/[\s\-\/]+/).filter(w => w.length > 2);
  return words[0] || undefined;
}

export function parseCSV(csvContent: string): ParsedTransaction[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error("CSV file must have at least a header row and one data row");
  }
  
  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  
  // Find relevant columns
  const dateCol = findColumn(headers, DATE_COLUMNS);
  const descCol = findColumn(headers, DESCRIPTION_COLUMNS);
  const amountCol = findColumn(headers, AMOUNT_COLUMNS);
  const creditCol = findColumn(headers, CREDIT_COLUMNS);
  const debitCol = findColumn(headers, DEBIT_COLUMNS);
  const typeCol = findColumn(headers, TYPE_COLUMNS);
  
  if (!dateCol && !descCol) {
    throw new Error("Could not identify date or description columns in CSV");
  }
  
  const transactions: ParsedTransaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < headers.length / 2) continue; // Skip empty rows
    
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Extract values
    const date = dateCol ? parseDate(row[dateCol]) : new Date().toISOString().split('T')[0];
    const description = descCol ? row[descCol].trim() : 'Unknown Transaction';
    
    let amount = 0;
    let type: "credit" | "debit" = "debit";
    
    if (creditCol && debitCol) {
      // Separate credit/debit columns
      const creditAmount = parseAmount(row[creditCol]);
      const debitAmount = parseAmount(row[debitCol]);
      
      if (creditAmount > 0) {
        amount = creditAmount;
        type = "credit";
      } else {
        amount = debitAmount;
        type = "debit";
      }
    } else if (amountCol) {
      // Single amount column
      const rawAmount = row[amountCol];
      amount = parseAmount(rawAmount);
      
      // Determine type from sign or type column
      if (typeCol) {
        const typeValue = row[typeCol].toLowerCase();
        type = typeValue.includes('cr') || typeValue.includes('credit') ? "credit" : "debit";
      } else if (rawAmount.includes('-') || rawAmount.includes('(')) {
        type = "debit";
      } else {
        // Use categorization to guess
        const category = categorizeTransaction(description);
        type = category === "Income" ? "credit" : "debit";
      }
    }
    
    if (amount > 0 && description) {
      const category = categorizeTransaction(description);
      
      transactions.push({
        date,
        description,
        amount,
        type,
        category,
        merchant: extractMerchant(description),
      });
    }
  }
  
  return transactions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

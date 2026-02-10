const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
];

const teens = [
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertHundreds(num: number): string {
  if (num === 0) return '';
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  
  let result = '';
  
  if (hundred > 0) {
    result += ones[hundred] + ' Hundred';
  }
  
  if (remainder > 0) {
    if (result) result += ' ';
    
    if (remainder < 10) {
      result += ones[remainder];
    } else if (remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      result += tens[ten];
      if (one > 0) {
        result += ' ' + ones[one];
      }
    }
  }
  
  return result;
}

export function amountInWordsINR(amount: number): string {
  if (isNaN(amount) || amount < 0) {
    return '—';
  }

  // Round to nearest rupee
  const rupees = Math.round(amount);

  if (rupees === 0) {
    return 'Zero Rupees Only';
  }

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  let words = '';

  if (crore > 0) {
    words += convertHundreds(crore) + ' Crore';
  }

  if (lakh > 0) {
    if (words) words += ' ';
    words += convertHundreds(lakh) + ' Lakh';
  }

  if (thousand > 0) {
    if (words) words += ' ';
    words += convertHundreds(thousand) + ' Thousand';
  }

  if (remainder > 0) {
    if (words) words += ' ';
    words += convertHundreds(remainder);
  }

  return 'Indian Rupee ' + words.trim() + ' Only';
}

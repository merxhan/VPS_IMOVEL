/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas)
 * CPF consists of 11 numeric digits, where the last 2 are check digits.
 */
export function isValidCPF(cpf: string): boolean {
  // Clean non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');

  // Must have 11 digits
  if (cleanCPF.length !== 11) return false;

  // Reject known invalid CPF patterns (e.g. all digits same)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Validates a Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * CNPJ consists of 14 numeric digits, where the last 2 are check digits.
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Clean non-numeric characters
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Must have 14 digits
  if (cleanCNPJ.length !== 14) return false;

  // Reject known invalid CNPJ patterns (e.g. all digits same)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Validate first check digit
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let rev = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (rev !== parseInt(digits.charAt(0))) return false;

  // Validate second check digit
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  rev = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (rev !== parseInt(digits.charAt(1))) return false;

  return true;
}

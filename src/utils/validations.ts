export function isValidName(value: string): boolean {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,}$/.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isAdult(birthDate: string): boolean {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

export function isValidFrenchPostalCode(
  postalCode: string
): boolean {
  return /^[0-9]{5}$/.test(postalCode);
}
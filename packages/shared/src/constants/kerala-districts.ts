export const KERALA_DISTRICTS = [
  { value: 'THIRUVANANTHAPURAM', label: 'Thiruvananthapuram' },
  { value: 'KOLLAM', label: 'Kollam' },
  { value: 'PATHANAMTHITTA', label: 'Pathanamthitta' },
  { value: 'ALAPPUZHA', label: 'Alappuzha' },
  { value: 'KOTTAYAM', label: 'Kottayam' },
  { value: 'IDUKKI', label: 'Idukki' },
  { value: 'ERNAKULAM', label: 'Ernakulam' },
  { value: 'THRISSUR', label: 'Thrissur' },
  { value: 'PALAKKAD', label: 'Palakkad' },
  { value: 'MALAPPURAM', label: 'Malappuram' },
  { value: 'KOZHIKODE', label: 'Kozhikode' },
  { value: 'WAYANAD', label: 'Wayanad' },
  { value: 'KANNUR', label: 'Kannur' },
  { value: 'KASARAGOD', label: 'Kasaragod' }
] as const;

export type KeralaDistrict = (typeof KERALA_DISTRICTS)[number]['value'];

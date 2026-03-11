export function encodeTagParam(tag: string): string {
  return encodeURIComponent(tag).replace(/%/g, '$');
}

export function decodeTagParam(value: string): string {
  const normalized = value.includes('$') ? value.replace(/\$/g, '%') : value;

  try {
    return decodeURIComponent(normalized);
  } catch {
    return value;
  }
}

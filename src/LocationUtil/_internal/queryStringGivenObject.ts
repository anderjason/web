export function queryStringGivenObject(input: any): string {
  if (input == null) {
    return "";
  }

  const pairs: any[] = [];

  Object.keys(input).forEach((key) => {
    let value = input[key];

    if (value != null) {
      value = encodeURIComponent(value);
      pairs.push(`${key}=${value}`);
    }
  });

  if (pairs.length === 0) {
    return "";
  }

  return `?${pairs.join("&")}`;
}

import { StringUtil } from "@anderjason/util";

export function objectGivenQueryString(queryString: string): any {
  const result: any = {};

  if (StringUtil.stringIsEmpty(queryString)) {
    return result;
  }

  const text = queryString.trim().replace(/^[?#&]/, "");
  if (text.length == 0) {
    return result;
  }

  const parts = text.split("&");
  parts.forEach((part) => {
    const partText = part.replace(/\+/g, " ");
    const splitPart = partText.split("=");

    const key = decodeURIComponent(splitPart[0]);
    let val = decodeURIComponent(splitPart[1]);

    result[key] = val;
  });

  return result;
}

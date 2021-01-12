import { StringUtil } from "@anderjason/util";

export function urlGivenUrlLike(input: string, assumeHttps?: boolean): string {
  if (StringUtil.stringIsEmpty(input)) {
    return undefined;
  }

  if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("mailto:")) {
    return input;
  }

  if (assumeHttps == true) {
    return `https://${input}`;
  } else {
    return `http://${input}`;
  }
}

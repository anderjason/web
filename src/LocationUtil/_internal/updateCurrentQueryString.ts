import { objectOfCurrentQueryString } from "./objectOfCurrentQueryString";
import { queryStringGivenObject } from "./queryStringGivenObject";

export function updateCurrentQueryString(values: any): void {
  if (values == null || Object.keys(values).length === 0) {
    return;
  }

  const previousValue = objectOfCurrentQueryString();

  const allValues = {
    ...previousValue,
    ...values,
  };

  const newQueryString = queryStringGivenObject(allValues);

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${newQueryString}`
  );
}

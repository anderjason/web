import { objectGivenQueryString } from "./objectGivenQueryString";

export function objectOfCurrentQueryString(): any {
  return objectGivenQueryString(window.location.search);
}

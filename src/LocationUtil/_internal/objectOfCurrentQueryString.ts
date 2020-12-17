import { objectGivenQueryString } from "./objectGivenQueryString";

export function objectOfCurrentQueryString(): any {
  if (typeof window === "undefined") {
    return {};
  }
  
  return objectGivenQueryString(window.location.search);
}

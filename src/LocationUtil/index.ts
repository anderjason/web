import { currentHostIsLocal } from "./_internal/currentHostIsLocal";
import { objectGivenQueryString } from "./_internal/objectGivenQueryString";
import { objectOfCurrentQueryString } from "./_internal/objectOfCurrentQueryString";
import { queryStringGivenObject } from "./_internal/queryStringGivenObject";
import { updateCurrentQueryString } from "./_internal/updateCurrentQueryString";

export class LocationUtil {
  static currentHostIsLocal = currentHostIsLocal;
  static objectGivenQueryString = objectGivenQueryString;
  static objectOfCurrentQueryString = objectOfCurrentQueryString;
  static queryStringGivenObject = queryStringGivenObject;
  static updateCurrentQueryString = updateCurrentQueryString;
}

import { Test } from "@anderjason/tests";
import { ElementSizeWatcher } from "./";

Test.define("ElementSizeWatcher can be created", () => {
  const div = {} as HTMLDivElement;

  new ElementSizeWatcher({
    element: div,
  });
});

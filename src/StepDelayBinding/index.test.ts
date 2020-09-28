import { Observable } from "@anderjason/observable";
import { Test } from "@anderjason/tests";
import { ManagedObject } from "skytree";
import { StepDelayBinding } from "./";

Test.define("StepDelayBinding returns the expected result", () => {
  const mo = new ManagedObject({});
  mo.activate();

  const input = Observable.givenValue("red");

  const stepDelay = mo.addManagedObject(
    new StepDelayBinding({
      input,
      stepsBehind: 3,
    })
  );

  Test.assert(stepDelay.output.value == null);

  input.setValue("orange");
  Test.assert(stepDelay.output.value == null);

  input.setValue("yellow");
  Test.assert(stepDelay.output.value == null);

  input.setValue("green");
  Test.assert(stepDelay.output.value === "red");

  input.setValue("blue");
  Test.assert(stepDelay.output.value == "orange");

  mo.deactivate();
});

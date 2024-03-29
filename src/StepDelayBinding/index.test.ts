import { Observable } from "@anderjason/observable";
import { Test } from "@anderjason/tests";
import { Actor } from "skytree";
import { StepDelayBinding } from "./";

Test.define("StepDelayBinding returns the expected result", () => {
  const mo = new Actor({});
  mo.activate();

  const input = Observable.givenValue("red");

  const stepDelay = mo.addActor(
    new StepDelayBinding({
      input,
      stepsBehind: 3,
    })
  );

  Test.assert(stepDelay.output.value == null, "value is null");

  input.setValue("orange");
  Test.assert(stepDelay.output.value == null, "value is still null");

  input.setValue("yellow");
  Test.assert(stepDelay.output.value == null, "value is still null");

  input.setValue("green");
  Test.assert(stepDelay.output.value === "red", "value is red");

  input.setValue("blue");
  Test.assert(stepDelay.output.value == "orange", "value is orange");

  mo.deactivate();
});

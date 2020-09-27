import { Test } from "@anderjason/tests";
import { SequentialChoice } from ".";

Test.define("SequentialChoice returns the expected result", () => {
  const choice = new SequentialChoice({
    options: ["a", "b", "c", "d"],
  });

  Test.assert(choice.currentOption.value === "a");
  Test.assert(choice.nextOption.value === "b");
  Test.assert(choice.previousOption.value === "d");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "b");
  Test.assert(choice.nextOption.value === "c");
  Test.assert(choice.previousOption.value === "a");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "c");
  Test.assert(choice.nextOption.value === "d");
  Test.assert(choice.previousOption.value === "b");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "d");
  Test.assert(choice.nextOption.value === "a");
  Test.assert(choice.previousOption.value === "c");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "a");
  Test.assert(choice.nextOption.value === "b");
  Test.assert(choice.previousOption.value === "d");

  // backwards

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "d");
  Test.assert(choice.nextOption.value === "a");
  Test.assert(choice.previousOption.value === "c");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "c");
  Test.assert(choice.nextOption.value === "d");
  Test.assert(choice.previousOption.value === "b");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "b");
  Test.assert(choice.nextOption.value === "c");
  Test.assert(choice.previousOption.value === "a");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "a");
  Test.assert(choice.nextOption.value === "b");
  Test.assert(choice.previousOption.value === "d");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "d");
  Test.assert(choice.nextOption.value === "a");
  Test.assert(choice.previousOption.value === "c");
});

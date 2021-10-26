import { Test } from "@anderjason/tests";
import { SequentialChoice } from ".";

Test.define("SequentialChoice returns the expected result", () => {
  const choice = new SequentialChoice({
    options: ["a", "b", "c", "d"],
  });

  Test.assert(choice.currentOption.value === "a", "currentOption is a");
  Test.assert(choice.nextOption.value === "b", "nextOption is b");
  Test.assert(choice.previousOption.value === "d", "previousOption is d");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "b", "currentOption is b");
  Test.assert(choice.nextOption.value === "c", "nextOption is c");
  Test.assert(choice.previousOption.value === "a", "previousOption is a");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "c", "currentOption is c");
  Test.assert(choice.nextOption.value === "d", "nextOption is d");
  Test.assert(choice.previousOption.value === "b", "previousOption is b");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "d", "currentOption is d");
  Test.assert(choice.nextOption.value === "a", "nextOption is a");
  Test.assert(choice.previousOption.value === "c", "previousOption is c");

  choice.selectNextOption();
  Test.assert(choice.currentOption.value === "a", "currentOption is a");
  Test.assert(choice.nextOption.value === "b", "nextOption is b");
  Test.assert(choice.previousOption.value === "d", "previousOption is d");

  // backwards

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "d", "currentOption is d");
  Test.assert(choice.nextOption.value === "a", "nextOption is a");
  Test.assert(choice.previousOption.value === "c", "previousOption is c");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "c", "currentOption is c");
  Test.assert(choice.nextOption.value === "d", "nextOption is d");
  Test.assert(choice.previousOption.value === "b", "previousOption is b");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "b", "currentOption is b");
  Test.assert(choice.nextOption.value === "c", "nextOption is c");
  Test.assert(choice.previousOption.value === "a", "previousOption is a");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "a", "currentOption is a");
  Test.assert(choice.nextOption.value === "b", "nextOption is b");
  Test.assert(choice.previousOption.value === "d", "previousOption is d");

  choice.selectPreviousOption();
  Test.assert(choice.currentOption.value === "d", "currentOption is d");
  Test.assert(choice.nextOption.value === "a", "nextOption is a");
  Test.assert(choice.previousOption.value === "c", "previousOption is c");
});

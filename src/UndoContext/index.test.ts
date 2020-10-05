import { Test } from "@anderjason/tests";
import { UndoContext } from ".";

Test.define("UndoContext returns the expected result", () => {
  const undoContext = new UndoContext<string>("initial", 10);

  Test.assert(undoContext.currentStep.value == "initial");
  Test.assert(undoContext.canUndo.value == false);
  Test.assert(undoContext.canRedo.value == false);

  undoContext.addStep("red");
  Test.assert(undoContext.currentStep.value == "red");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false);

  undoContext.addStep("orange");
  Test.assert(undoContext.currentStep.value == "orange");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); // 9

  undoContext.addStep("yellow");
  Test.assert(undoContext.currentStep.value == "yellow");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); // 12

  undoContext.redo();
  Test.assert(undoContext.currentStep.value == "yellow");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); //15

  undoContext.undo();
  Test.assert(undoContext.currentStep.value == "orange", "orange");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); //18

  undoContext.undo();
  Test.assert(undoContext.currentStep.value == "red");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); //21

  undoContext.undo();
  Test.assert(
    undoContext.currentStep.value == "initial",
    undoContext.currentStep.value
  );
  Test.assert(undoContext.canUndo.value == false);
  Test.assert(undoContext.canRedo.value == true); //24

  undoContext.redo();
  Test.assert(undoContext.currentStep.value == "red");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); // 27

  undoContext.redo();
  Test.assert(undoContext.currentStep.value == "orange");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); // 30

  undoContext.addStep("green");
  Test.assert(undoContext.currentStep.value == "green");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); // 33
});

Test.define("UndoContext limits the number of steps", () => {
  const undoContext = new UndoContext("initial", 3);
  undoContext.addStep("one");
  undoContext.addStep("two");

  Test.assertIsDeepEqual(
    ["initial", "one", "two"],
    (undoContext as any)._undoStack
  );

  undoContext.addStep("three");

  Test.assertIsDeepEqual(
    ["one", "two", "three"],
    (undoContext as any)._undoStack
  );
});

Test.define("UndoContext can clear steps", () => {
  const undoContext = new UndoContext("initial", 10);
  undoContext.addStep("one");
  undoContext.addStep("two");
  undoContext.addStep("three");
  undoContext.addStep("four");
  undoContext.undo();
  undoContext.clearSteps();

  Test.assert(undoContext.currentStep.value === "three");
  Test.assert(undoContext.canUndo.value == false);
  Test.assert(undoContext.canRedo.value == false);
});

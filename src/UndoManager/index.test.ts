import { Test } from "@anderjason/tests";
import { UndoManager } from ".";

Test.define("UndoManager returns the expected result", () => {
  const undoManager = new UndoManager<string>("initial", 10);

  Test.assert(undoManager.currentStep.value == "initial");
  Test.assert(undoManager.canUndo.value == false);
  Test.assert(undoManager.canRedo.value == false);

  undoManager.addStep("red");
  Test.assert(undoManager.currentStep.value == "red");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == false);

  undoManager.addStep("orange");
  Test.assert(undoManager.currentStep.value == "orange");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == false); // 9

  undoManager.addStep("yellow");
  Test.assert(undoManager.currentStep.value == "yellow");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == false); // 12

  undoManager.redo();
  Test.assert(undoManager.currentStep.value == "yellow");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == false); //15

  undoManager.undo();
  Test.assert(undoManager.currentStep.value == "orange", "orange");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == true); //18

  undoManager.undo();
  Test.assert(undoManager.currentStep.value == "red");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == true); //21

  undoManager.undo();
  Test.assert(
    undoManager.currentStep.value == "initial",
    undoManager.currentStep.value
  );
  Test.assert(undoManager.canUndo.value == false);
  Test.assert(undoManager.canRedo.value == true); //24

  undoManager.redo();
  Test.assert(undoManager.currentStep.value == "red");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == true); // 27

  undoManager.redo();
  Test.assert(undoManager.currentStep.value == "orange");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == true); // 30

  undoManager.addStep("green");
  Test.assert(undoManager.currentStep.value == "green");
  Test.assert(undoManager.canUndo.value == true);
  Test.assert(undoManager.canRedo.value == false); // 33
});

Test.define("UndoManager limits the number of steps", () => {
  const undoManager = new UndoManager("initial", 3);
  undoManager.addStep("one");
  undoManager.addStep("two");

  Test.assertIsDeepEqual(
    ["initial", "one", "two"],
    (undoManager as any)._undoStack
  );

  undoManager.addStep("three");

  Test.assertIsDeepEqual(
    ["one", "two", "three"],
    (undoManager as any)._undoStack
  );
});

Test.define("UndoManager can clear steps", () => {
  const undoManager = new UndoManager("initial", 10);
  undoManager.addStep("one");
  undoManager.addStep("two");
  undoManager.addStep("three");
  undoManager.addStep("four");
  undoManager.undo();
  undoManager.clearSteps();

  Test.assert(undoManager.currentStep.value === "three");
  Test.assert(undoManager.canUndo.value == false);
  Test.assert(undoManager.canRedo.value == false);
});

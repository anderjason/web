import { Test } from "@anderjason/tests";
import { UndoContext } from ".";

Test.define("UndoContext returns the expected result", () => {
  const undoContext = new UndoContext<string>("initial", 10);

  Test.assert(undoContext.output.value == "initial", "output is initial");
  Test.assert(undoContext.canUndo.value == false, "canUndo is false");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");

  undoContext.pushStep("red");
  Test.assert(undoContext.output.value == "red", "output is red");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");

  undoContext.pushStep("orange");
  Test.assert(undoContext.output.value == "orange", "output is orange");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");

  undoContext.pushStep("yellow");
  Test.assert(undoContext.output.value == "yellow", "output is yellow");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");

  undoContext.redo();
  Test.assert(undoContext.output.value == "yellow", "output is yellow");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");

  undoContext.undo();
  Test.assert(undoContext.output.value == "orange", "orange");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == true, "canRedo is true");

  undoContext.undo();
  Test.assert(undoContext.output.value == "red", "red");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == true, "canRedo is true");

  undoContext.undo();
  Test.assert(undoContext.output.value == "initial", undoContext.output.value);
  Test.assert(undoContext.canUndo.value == false, "canUndo is false");
  Test.assert(undoContext.canRedo.value == true, "canRedo is true"); 

  undoContext.redo();
  Test.assert(undoContext.output.value == "red", "red");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == true, "canRedo is true");

  undoContext.redo();
  Test.assert(undoContext.output.value == "orange", "orange");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == true, "canRedo is true");

  undoContext.pushStep("green");
  Test.assert(undoContext.output.value == "green", "green");
  Test.assert(undoContext.canUndo.value == true, "canUndo is true");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");
});

Test.define("UndoContext limits the number of steps", () => {
  const undoContext = new UndoContext("initial", 3);
  undoContext.pushStep("one");
  undoContext.pushStep("two");

  Test.assertIsDeepEqual(
    ["initial", "one", "two"],
    undoContext.steps.toValues(),
    "steps are correct"
  );

  undoContext.pushStep("three");

  Test.assertIsDeepEqual(["one", "two", "three"], undoContext.steps.toValues(), "steps are correct");
});

Test.define("UndoContext can clear steps completely", () => {
  const undoContext = new UndoContext("initial", 10);
  undoContext.pushStep("one");
  undoContext.pushStep("two");
  undoContext.pushStep("three");
  undoContext.pushStep("four");
  undoContext.clearSteps("clearAll");

  Test.assert(undoContext.output.value == null, "output is null");
  Test.assert(undoContext.canUndo.value == false, "canUndo is false");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");
});

Test.define("UndoContext can clear steps and keep the current output", () => {
  const undoContext = new UndoContext("initial", 10);
  undoContext.pushStep("one");
  undoContext.pushStep("two");
  undoContext.pushStep("three");
  undoContext.pushStep("four");
  undoContext.undo();
  undoContext.clearSteps("keepCurrent");

  Test.assert(undoContext.output.value == "three", "output is three");
  Test.assert(undoContext.currentIndex.value === 0, "currentIndex is 0");
  Test.assert(undoContext.canUndo.value == false, "canUndo is false");
  Test.assert(undoContext.canRedo.value == false, "canRedo is false");
});

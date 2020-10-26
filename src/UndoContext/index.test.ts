import { Test } from "@anderjason/tests";
import { UndoContext } from ".";

Test.define("UndoContext returns the expected result", () => {
  const undoContext = new UndoContext<string>("initial", 10);

  Test.assert(undoContext.output.value == "initial");
  Test.assert(undoContext.canUndo.value == false);
  Test.assert(undoContext.canRedo.value == false);

  undoContext.pushStep("red");
  Test.assert(undoContext.output.value == "red");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false);

  undoContext.pushStep("orange");
  Test.assert(undoContext.output.value == "orange");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); // 9

  undoContext.pushStep("yellow");
  Test.assert(undoContext.output.value == "yellow");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); // 12

  undoContext.redo();
  Test.assert(undoContext.output.value == "yellow");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); //15

  undoContext.undo();
  Test.assert(undoContext.output.value == "orange", "orange");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); //18

  undoContext.undo();
  Test.assert(undoContext.output.value == "red");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); //21

  undoContext.undo();
  Test.assert(undoContext.output.value == "initial", undoContext.output.value);
  Test.assert(undoContext.canUndo.value == false);
  Test.assert(undoContext.canRedo.value == true); //24

  undoContext.redo();
  Test.assert(undoContext.output.value == "red");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); // 27

  undoContext.redo();
  Test.assert(undoContext.output.value == "orange");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == true); // 30

  undoContext.pushStep("green");
  Test.assert(undoContext.output.value == "green");
  Test.assert(undoContext.canUndo.value == true);
  Test.assert(undoContext.canRedo.value == false); // 33
});

Test.define("UndoContext limits the number of steps", () => {
  const undoContext = new UndoContext("initial", 3);
  undoContext.pushStep("one");
  undoContext.pushStep("two");

  Test.assertIsDeepEqual(
    ["initial", "one", "two"],
    undoContext.steps.toValues()
  );

  undoContext.pushStep("three");

  Test.assertIsDeepEqual(["one", "two", "three"], undoContext.steps.toValues());
});

Test.define("UndoContext can clear steps completely", () => {
  const undoContext = new UndoContext("initial", 10);
  undoContext.pushStep("one");
  undoContext.pushStep("two");
  undoContext.pushStep("three");
  undoContext.pushStep("four");
  undoContext.clearSteps("clearAll");

  Test.assert(undoContext.output.value == null);
  Test.assert(undoContext.canUndo.value == false);
  Test.assert(undoContext.canRedo.value == false);
});

Test.define("UndoContext can clear steps and keep the current output", () => {
  const undoContext = new UndoContext("initial", 10);
  undoContext.pushStep("one");
  undoContext.pushStep("two");
  undoContext.pushStep("three");
  undoContext.pushStep("four");
  undoContext.undo();
  undoContext.clearSteps("keepCurrent");

  Test.assert(undoContext.output.value == "three");
  Test.assert(undoContext.currentIndex.value === 0);
  Test.assert(undoContext.canUndo.value == false);
  Test.assert(undoContext.canRedo.value == false);
});

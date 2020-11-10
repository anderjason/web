import { Test } from "@anderjason/tests";
import "./Corners/index.test";
import "./ElementSizeWatcher/index.test";
import "./ObservableState/index.test";
import "./SequentialChoice/index.test";
import "./StepDelayBinding/index.test";
import "./Transform/index.test";
import "./UndoContext/index.test";

Test.runAll()
  .then(() => {
    console.log("Tests complete");
  })
  .catch((err) => {
    console.error(err);
    console.error("Tests failed");
  });

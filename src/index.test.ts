import { Test } from "@anderjason/tests";
import "./Corners/index.test";
import "./SequentialChoice/index.test";
import "./Transform/index.test";
import "./UndoManager/index.test";

Test.runAll()
  .then(() => {
    console.log("Tests complete");
  })
  .catch((err) => {
    console.error(err);
    console.error("Tests failed");
  });

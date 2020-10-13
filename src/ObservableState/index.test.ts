import { Test } from "@anderjason/tests";
import { ValuePath } from "@anderjason/util";
import { ObservableState } from ".";

Test.define("ObservableState can be created without an initial state", () => {
  const os = new ObservableState({});
  os.activate();

  Test.assertIsDeepEqual(os.state.value, {});

  os.deactivate();
});

Test.define("ObservableState stores a deep copy of the input value", () => {
  const original = {
    design: {
      colors: {
        background: "red",
      },
    },
  };

  const os = new ObservableState({
    initialState: original,
  });
  os.activate();

  Test.assertIsDeepEqual(os.state.value, original);
  Test.assert(os.state.value !== original);

  const colorsPath = ValuePath.givenString("design.colors");
  const colors = {
    background: "blue",
    foreground: "green",
  };

  os.update(colorsPath, colors);

  Test.assertIsDeepEqual(os.toOptionalValueGivenPath(colorsPath), colors);

  colors.background = "orange"; // should have no effect in the observable state

  Test.assertIsDeepEqual(os.toOptionalValueGivenPath(colorsPath), {
    background: "blue",
    foreground: "green",
  });

  os.deactivate();
});

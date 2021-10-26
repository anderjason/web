import { Test } from "@anderjason/tests";
import { ValuePath } from "@anderjason/util";
import { ObservableState } from ".";

Test.define("ObservableState can be created without an initial state", () => {
  const os = new ObservableState({});
  os.activate();

  Test.assertIsDeepEqual(os.state.value, {}, "actual is equal to expected");

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

  Test.assertIsDeepEqual(os.state.value, original, "observablestate is deep equal to original");
  Test.assert(os.state.value !== original, "observablestate is not equal to original");

  const colorsPath = ValuePath.givenString("design.colors");
  const colors = {
    background: "blue",
    foreground: "green",
  };

  const colorsBinding = os.addActor(
    os.toBinding({
      valuePath: colorsPath,
    })
  );

  Test.assert(colorsBinding.isActive == true, "binding is active");

  colorsBinding.output.setValue(colors);

  const actual = os.toOptionalValueGivenPath(colorsPath);
  Test.assertIsDeepEqual(actual, colors, "actual is deep equal to expected");

  colors.background = "orange"; // should have no effect in the observable state

  Test.assertIsDeepEqual(os.toOptionalValueGivenPath(colorsPath), {
    background: "blue",
    foreground: "green",
  }, "actual is deep equal to expected");

  os.deactivate();
});

Test.define("ObservableState can include arrays", () => {
  const colors = ["red", "orange", "yellow"];

  const os = new ObservableState({
    initialState: {
      design: {
        colors,
      },
    },
  });
  os.activate();

  Test.assertIsDeepEqual(
    os.toOptionalValueGivenPath(ValuePath.givenString("design.colors")),
    ["red", "orange", "yellow"],
    "actual is deep equal to expected"
  );

  colors.push("green"); // should have no effect in the observable state

  Test.assertIsDeepEqual(
    os.toOptionalValueGivenPath(ValuePath.givenString("design.colors")),
    ["red", "orange", "yellow"],
    "actual is deep equal to expected"
  );

  os.deactivate();
});

Test.define("ObservableState can set primitive values", () => {
  const os = new ObservableState({
    initialState: {
      design: {
        colors: {
          background: "red",
        },
      },
    },
  });
  os.activate();

  const backgroundBinding = os.addActor(
    os.toBinding({
      valuePath: ValuePath.givenString("design.colors.background"),
    })
  );

  backgroundBinding.output.setValue("blue");

  Test.assertIsDeepEqual(os.state.value, {
    design: {
      colors: {
        background: "blue",
      },
    },
  }, "actual is deep equal to expected");

  os.deactivate();
});

Test.define("ObservableState can set undefined", () => {
  const os = new ObservableState({
    initialState: {
      design: {
        colors: {
          background: "red",
        },
      },
    },
  });
  os.activate();

  const backgroundBinding = os.addActor(
    os.toBinding({
      valuePath: ValuePath.givenString("design.colors.background"),
    })
  );

  backgroundBinding.output.setValue(undefined);

  Test.assertIsDeepEqual(os.state.value, {
    design: {
      colors: {
        background: undefined,
      },
    },
  }, "actual is deep equal to expected");

  os.deactivate();
});

Test.define("ObservableState can set arrays", () => {
  const os = new ObservableState({
    initialState: {
      design: {
        colors: ["red", "orange"],
      },
    },
  });
  os.activate();

  const colorsBinding = os.addActor(
    os.toBinding({
      valuePath: ValuePath.givenString("design.colors"),
    })
  );

  colorsBinding.output.setValue(["green", "blue"]);

  Test.assertIsDeepEqual(os.state.value, {
    design: {
      colors: ["green", "blue"],
    },
  }, "actual is deep equal to expected");

  os.deactivate();
});

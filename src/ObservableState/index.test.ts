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

  const colorsBinding = os.addActor(
    os.toBinding({
      valuePath: colorsPath,
    })
  );

  Test.assert(colorsBinding.isActive == true);

  colorsBinding.output.setValue(colors);

  const actual = os.toOptionalValueGivenPath(colorsPath);
  Test.assertIsDeepEqual(actual, colors);

  colors.background = "orange"; // should have no effect in the observable state

  Test.assertIsDeepEqual(os.toOptionalValueGivenPath(colorsPath), {
    background: "blue",
    foreground: "green",
  });

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
    ["red", "orange", "yellow"]
  );

  colors.push("green"); // should have no effect in the observable state

  Test.assertIsDeepEqual(
    os.toOptionalValueGivenPath(ValuePath.givenString("design.colors")),
    ["red", "orange", "yellow"]
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
  });

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
  });

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
  });

  os.deactivate();
});

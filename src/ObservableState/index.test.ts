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

  os.update(ValuePath.givenString("design.colors.background"), "blue");

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

  os.update(ValuePath.givenString("design.colors.background"), undefined);

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

  os.update(ValuePath.givenString("design.colors"), ["green", "blue"]);

  Test.assertIsDeepEqual(os.state.value, {
    design: {
      colors: ["green", "blue"],
    },
  });

  os.deactivate();
});

Test.define(
  "ObservableState only updates if the resulting state changes",
  () => {
    const os = new ObservableState({
      initialState: {
        design: {
          colors: ["red", "orange"],
        },
      },
    });
    os.activate();

    let didUpdate: boolean;

    didUpdate = os.update(ValuePath.givenString("design.colors"), [
      "green",
      "blue",
    ]);
    Test.assert(didUpdate == true);

    didUpdate = os.update(ValuePath.givenString("design.colors"), [
      "green",
      "blue",
    ]);
    Test.assert(didUpdate == false);

    os.deactivate();
  }
);

import { ObservableArray } from "@anderjason/observable";
import { IntersectionWatcherDemo } from "./IntersectionWatcherDemo";
import { ScrollAreaDemo } from "./ScrollAreaDemo";
import { ExampleDefinition, ExamplesHome } from "@anderjason/example-tools";
import { UndoDemo } from "./UndoDemo";
import { KeyboardWatcherDemo } from "./KeyboardWatcherDemo";
import { ElementSizeWatcherDemo } from "./ElementSizeWatcherDemo";
import { TransitionDemo } from "./TransitionDemo";
import { VerticalExpanderDemo } from "./VerticalExpanderDemo";

const definitions = ObservableArray.givenValues<ExampleDefinition>([
  {
    title: "Vertical expander",
    actor: new VerticalExpanderDemo(),
  },
  {
    title: "Transition",
    actor: new TransitionDemo(),
  },
  {
    title: "Element size watcher",
    actor: new ElementSizeWatcherDemo(),
  },
  {
    title: "Intersection watcher",
    actor: new IntersectionWatcherDemo(),
  },
  {
    title: "Scroll area",
    actor: new ScrollAreaDemo(),
  },
  {
    title: "Undo",
    actor: new UndoDemo(),
  },
  {
    title: "Keyboard watcher",
    actor: new KeyboardWatcherDemo(),
  },
]);

const main = new ExamplesHome({
  title: "@anderjason/web",
  definitions,
});
main.activate();

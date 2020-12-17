import { ElementSizeWatcherDemo } from "./ElementSizeWatcherDemo";
import { ExampleDefinition, ExamplesHome } from "@anderjason/example-tools";
import { IntersectionWatcherDemo } from "./IntersectionWatcherDemo";
import { KeyboardWatcherDemo } from "./KeyboardWatcherDemo";
import { ObservableArray } from "@anderjason/observable";
import { ScrollAreaAnchorDemo } from "./ScrollAreaAnchorDemo";
import { ScrollAreaDemo } from "./ScrollAreaDemo";
import { TransitionDemo } from "./TransitionDemo";
import { UndoDemo } from "./UndoDemo";
import { VerticalExpanderDemo } from "./VerticalExpanderDemo";

const definitions = ObservableArray.givenValues<ExampleDefinition>([
  {
    title: "Element size watcher",
    actor: new ElementSizeWatcherDemo(),
  },
  {
    title: "Intersection watcher",
    actor: new IntersectionWatcherDemo(),
  },
  {
    title: "Keyboard watcher",
    actor: new KeyboardWatcherDemo(),
  },
  {
    title: "Scroll area",
    actor: new ScrollAreaDemo(),
  },
  {
    title: "Scroll area anchor",
    actor: new ScrollAreaAnchorDemo(),
  },
  {
    title: "Transition",
    actor: new TransitionDemo(),
  },
  {
    title: "Undo",
    actor: new UndoDemo(),
  },
  {
    title: "Vertical expander",
    actor: new VerticalExpanderDemo(),
  },
]);

const main = new ExamplesHome({
  title: "@anderjason/web",
  definitions,
});
main.activate();

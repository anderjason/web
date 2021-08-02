import { ExampleDefinition, ExamplesHome } from "@anderjason/example-tools";
import { ObservableArray } from "@anderjason/observable";
import { ScrollAreaDemo } from "./ScrollAreaDemo";
import { ScrollAreaInsetBothDemo } from "./ScrollAreaInsetBothDemo";
import { ScrollAreaInsetHorizontalDemo } from "./ScrollAreaInsetHorizontalDemo";
import { ScrollAreaInsetSmallDemo } from "./ScrollAreaInsetSmallDemo";
import { ScrollAreaInsetVerticalDemo } from "./ScrollAreaInsetVerticalDemo";
import { ElementSizeWatcherDemo } from "./ElementSizeWatcherDemo";
import { IntersectionWatcherDemo } from "./IntersectionWatcherDemo";
import { KeyboardWatcherDemo } from "./KeyboardWatcherDemo";
import { ScrollAreaAnchorDemo } from "./ScrollAreaAnchorDemo";
import { TextInputBindingDemo } from "./TextInputBindingDemo";
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
    title: "Scroll area inset vertical",
    actor: new ScrollAreaInsetVerticalDemo(),
  },
  {
    title: "Scroll area inset horizontal",
    actor: new ScrollAreaInsetHorizontalDemo(),
  },
  {
    title: "Scroll area inset both",
    actor: new ScrollAreaInsetBothDemo(),
  },
  {
    title: "Scroll area inset small",
    actor: new ScrollAreaInsetSmallDemo(),
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
    title: "Text input binding",
    actor: new TextInputBindingDemo(),
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

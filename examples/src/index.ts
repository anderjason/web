import { ObservableArray } from "@anderjason/observable";
import { ElementBoundsWatcherDemo } from "./ElementBoundsWatcherDemo";
import { IntersectionWatcherDemo } from "./IntersectionWatcherDemo";
import { ScrollAreaDemo } from "./ScrollAreaDemo";
import { ExampleDefinition, ExamplesHome } from "@anderjason/example-tools";

const definitions = ObservableArray.givenValues<ExampleDefinition>([
  {
    title: "Element bounds watcher",
    actor: new ElementBoundsWatcherDemo({}),
  },
  {
    title: "Intersection watcher",
    actor: new IntersectionWatcherDemo({}),
  },
  {
    title: "Scroll area",
    actor: new ScrollAreaDemo({}),
  },
]);

const main = new ExamplesHome({
  title: "@anderjason/web",
  definitions,
});
main.activate();

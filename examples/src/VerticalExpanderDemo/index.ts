import { DemoActor } from "@anderjason/example-tools";
import { Observable } from "@anderjason/observable";
import { Duration } from "@anderjason/time";
import { Timer } from "skytree";
import { ElementStyle, SequentialChoice, VerticalExpander } from "../../../src";

export class VerticalExpanderDemo extends DemoActor<void> {
  onActivate() {
    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const sequentialChoice = new SequentialChoice({
      options: [0, 1, 2],
    });

    const isExpanded1 = Observable.givenValue(true, Observable.isStrictEqual);
    const isExpanded2 = Observable.givenValue(false, Observable.isStrictEqual);

    this.addActor(
      new Timer({
        duration: Duration.givenSeconds(3),
        isRepeating: true,
        fn: () => {
          sequentialChoice.selectNextOption();

          const value = sequentialChoice.currentOption.value;
          isExpanded1.setValue(value === 1);
          isExpanded2.setValue(value === 2);
        },
      })
    );

    this.addActor(
      ToggleButtonStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
        innerHTML: "Header one",
      })
    );

    const expander1 = this.addActor(
      new VerticalExpander({
        parentElement: wrapper.element,
        isExpanded: isExpanded1,
        maxHeight: 200,
      })
    );

    const demoContent1 = this.addActor(
      DemoContentStyle.toManagedElement({
        tagName: "div",
        parentElement: expander1.element,
      })
    );

    demoContent1.element.innerHTML = `
      <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare varius lectus, eu eleifend lacus volutpat sit amet. Nulla hendrerit massa eu nulla molestie, ut malesuada dolor ultricies. Nam vestibulum interdum consequat. Nunc eu gravida tellus, non fringilla ex. Cras in rutrum felis. Quisque ultricies nisl ultrices justo consequat iaculis. Nunc a leo sed arcu lacinia suscipit. Vivamus auctor euismod mauris finibus fringilla. Pellentesque vestibulum lectus eu faucibus dapibus. Cras elementum tortor a purus sollicitudin, et commodo velit sagittis. Sed in dapibus neque. Nulla mattis tellus vitae ultrices malesuada. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</div>

      <p>Ut sollicitudin tellus sed tortor ultricies, in malesuada turpis imperdiet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis accumsan nisl a felis ultricies bibendum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed imperdiet sed ante quis vulputate. Morbi porta velit nec dolor interdum dapibus. In auctor odio quis felis posuere laoreet. Cras vel efficitur neque, eget lobortis dui. Nulla fringilla orci suscipit, volutpat odio sit amet, lacinia eros. Pellentesque ac sem vel erat dignissim mollis ac et mi.</p>
      
      <div>Aenean id euismod massa, in ullamcorper nunc. Nam rhoncus elit non mauris varius rhoncus. Phasellus pulvinar nulla at lorem lobortis, vel tempor magna laoreet. Aenean condimentum, purus et rhoncus maximus, elit elit volutpat diam, nec mattis erat diam ut mauris. Proin nec vestibulum enim. Fusce sit amet pulvinar enim, sit amet rhoncus nisl. Nam ultrices velit vitae congue tempor.</div>
    `;

    this.addActor(
      ToggleButtonStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
        innerHTML: "Header two",
      })
    );

    const expander2 = this.addActor(
      new VerticalExpander({
        parentElement: wrapper.element,
        isExpanded: isExpanded2,
        minHeight: 25,
      })
    );

    const demoContent2 = this.addActor(
      DemoContentStyle.toManagedElement({
        tagName: "div",
        parentElement: expander2.element,
      })
    );

    demoContent2.element.innerHTML = `
      <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare varius lectus, eu eleifend lacus volutpat sit amet.</div>
    `;

    this.addActor(
      ToggleButtonStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
        innerHTML: "Header three",
      })
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "Wrapper",
  css: `
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 10px;
    top: 10px;
  `,
});

const DemoContentStyle = ElementStyle.givenDefinition({
  css: `
    background: #282828;
    color: #FFF;
    padding: 20px;
    border-radius: 4px;
  `,
});

const ToggleButtonStyle = ElementStyle.givenDefinition({
  css: `
    background: #444;
    padding: 10px 20px;
    color: #FFF;
    font-weight: bold;
    border-bottom: 1px solid #282828;
  `,
});

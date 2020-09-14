import { mount } from "@vue/test-utils";
import Parcel from "./parcel.vue";

describe("Parcel", () => {
  it("should not render without a config", () => {
    const wrapper = mount(Parcel);
    expect(wrapper.vm.$refs).toStrictEqual({});
  });

  it("should render if config is provided", () => {
    const wrapper = mount(Parcel, {
      propsData: {
        config: {
          appendTo: "div",
          elClass: "parcel-element"
        }
      }
    });

    expect(wrapper.find(".parcel-element").exists()).toBe(true);
  });

  it("should append to div if no 'appendTo' is provided", () => {
    const wrapper = mount(Parcel, {
      propsData: {
        config: {
          elClass: "div-element"
        }
      }
    });

    const elTag = wrapper.get(".div-element").element.tagName;
    expect(elTag).toBe("DIV");
  });

  it("should append parcel to provided element", () => {
    const wrapper = mount(Parcel, {
      propsData: {
        config: { appendTo: "span", elClass: "span-el" }
      }
    });

    expect(wrapper.get("span").exists()).toBe(true);
  });

  it("should use provided style for the parcel element", () => {
    const wrapper = mount(Parcel, {
      propsData: {
        config: {
          elClass: "parcel-el",
          wrapStyle: { color: "green", height: "100px" }
        }
      }
    });

    const domElement = wrapper.get(".parcel-el").html();
    expect(domElement.toString()).toContain(
      'style="color: green; height: 100px;"'
    );
  });
});

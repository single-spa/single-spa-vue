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

  it("should append parcel to provided element", () => {
    const wrapper = mount(Parcel, {
      propsData: {
        config: { appendTo: "span" }
      }
    });

    expect(wrapper.get("span").exists()).toBe(true);
  });
});

import { mount } from "@vue/test-utils";
import Parcel from "./parcel.vue";

describe("Parcel", () => {
  it("should not render without a config", () => {
    const wrapper = mount(Parcel);

    expect(wrapper.find(".no-config").exists()).toBe(true);
  });

  it("should render if config is provided", () => {
    const wrapper = mount(Parcel, {
      propsData: {
        config: { appendTo: "div" }
      }
    });

    expect(wrapper.find(".parcel-container").exists()).toBe(true);
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

import { mount } from "@vue/test-utils";
import Parcel from "./parcel.vue";

describe("Parcel", () => {
  it("should not render without a config", () => {
    const wrapper = mount(Parcel);

    expect(wrapper.find(".parcel-container").exists()).toBe(false);
  });

  it("should render if config is provided", () => {
    const wrapper = mount(Parcel, {
      propsData: {
        config: { aloha: "malaho" }
      }
    });

    expect(wrapper.find(".parcel-container").exists()).toBe(true);
  });
});

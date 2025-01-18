import { mount } from "@vue/test-utils";
import {
  mountRootParcel,
  registerApplication,
  start,
  triggerAppChange,
  unregisterApplication,
} from "single-spa";
import Parcel from "./parcel.js";

describe("Parcel", () => {
  let wrapper;

  beforeAll(() => {
    start();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }

    wrapper = null;
  });

  it("should throw an error if incorrect props are provided", async () => {
    try {
      mount(Parcel);
      fail("Mounting should fail without config prop");
    } catch (err) {
      expect(err.message).toMatch(/component requires a config prop/);
    }
  });

  it("should render if config and mountParcel are provided", async () => {
    const wrapper = await mount(Parcel, {
      propsData: {
        config: createParcelConfig(),
        mountParcel: mountRootParcel,
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();

    expect(wrapper.find("button#parcel").exists()).toBe(true);
    expect(wrapper.find("button#parcel").text()).toEqual("The parcel button");
  });

  it("should wrap with to div if no 'wrapWith' is provided", async () => {
    const wrapper = await mount(Parcel, {
      propsData: {
        config: createParcelConfig(),
        mountParcel: mountRootParcel,
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();

    expect(wrapper.find("div").exists()).toBe(true);
  });

  it("should respect the wrapWith, wrapClass, and wrapStyle props", async () => {
    wrapper = await mount(Parcel, {
      propsData: {
        config: createParcelConfig(),
        wrapWith: "span",
        wrapClass: "the-class",
        wrapStyle: {
          backgroundColor: "red",
        },
        mountParcel: mountRootParcel,
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();

    expect(wrapper.find("span").exists()).toBe(true);
    expect(wrapper.find("span").classes()).toContain("the-class");
    expect(wrapper.find("span").attributes("style")).toEqual(
      "background-color: red;"
    );

    expect(wrapper.find("span").find("button#parcel").exists()).toBe(true);
    expect(wrapper.find("span").find("button#parcel").text()).toBe(
      "The parcel button"
    );
  });

  it("should unmount properly", async () => {
    const config = createParcelConfig();
    const wrapper = await mount(Parcel, {
      propsData: {
        config,
        mountParcel: mountRootParcel,
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();
    expect(config.mounted).toBe(true);

    expect(wrapper.find("button#parcel").exists()).toBe(true);

    await wrapper.destroy();

    await tick();

    expect(config.mounted).toBe(false);
  });

  it("forwards parcelProps to the parcel", async () => {
    const config = createParcelConfig();
    const wrapper = await mount(Parcel, {
      propsData: {
        config,
        mountParcel: mountRootParcel,
        parcelProps: {
          foo: "bar",
        },
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();
    expect(config.mounted).toBe(true);
    expect(config.props).toMatchObject({ foo: "bar" });
  });

  it("calls parcel.update when update is defined", async () => {
    const config = createParcelConfig({ update: true });

    const wrapper = await mount(Parcel, {
      propsData: {
        config,
        mountParcel: mountRootParcel,
        parcelProps: {
          numUsers: 10,
        },
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();
    expect(config.mounted).toBe(true);
    expect(config.props).toMatchObject({
      numUsers: 10,
    });

    wrapper.setProps({
      parcelProps: {
        numUsers: 100,
      },
    });

    await tick();

    expect(wrapper.emitted().parcelUpdated).toBeTruthy();
    expect(config.props).toMatchObject({
      numUsers: 100,
    });
  });

  it(`doesn't die when the parcel config doesn't have an update function`, async () => {
    const config = createParcelConfig();

    const wrapper = await mount(Parcel, {
      propsData: {
        config,
        mountParcel: mountRootParcel,
        parcelProps: {
          numUsers: 10,
        },
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();
    expect(config.mounted).toBe(true);
    expect(config.props).toMatchObject({
      numUsers: 10,
    });

    wrapper.setProps({
      parcelProps: {
        numUsers: 100,
      },
    });

    await tick();

    expect(wrapper.emitted().parcelUpdated).toBeFalsy();
    expect(config.props).toMatchObject({
      // since the parcel config doesn't have an update function,
      // the numUsers prop on the parcel won't update when the
      // <parcel> vue component updates
      numUsers: 10,
    });
  });

  it(`allows you to pass in a promise that resolves with the config object`, async () => {
    const config = createParcelConfig();

    const wrapper = await mount(Parcel, {
      propsData: {
        config: Promise.resolve(config),
        mountParcel: mountRootParcel,
      },
    });

    await tick();

    expect(wrapper.emitted().parcelMounted).toBeTruthy();
    expect(config.mounted).toBe(true);
    expect(wrapper.find("button#parcel").exists()).toBe(true);
  });

  fit(`doesn't throw error if parent application is unmounted`, async () => {
    let appMounted = true;
    const config = createParcelConfig();

    registerApplication({
      name: "parent-app-unmount",
      activeWhen() {
        return appMounted;
      },
      app: {
        async bootstrap() {},
        async mount(props) {
          wrapper = await mount(Parcel, {
            propsData: {
              config,
              mountParcel: props.mountParcel,
            },
          });
        },
        async unmount() {},
      },
    });

    await triggerAppChange();
    await tick();

    expect(config.mounted).toBe(true);

    appMounted = false;

    await triggerAppChange();

    expect(config.mounted).toBe(false);

    // This is what caused the error in https://github.com/single-spa/single-spa-vue/pull/95
    // Trying to unmount the vue component after the single-spa app already unmounted the parcel
    await wrapper.destroy();

    unregisterApplication("parent-app-unmount");
  });
});

function createParcelConfig(opts = {}) {
  const result = {
    async mount(props) {
      const button = document.createElement("button");
      button.textContent = `The parcel button`;
      button.id = "parcel";
      props.domElement.appendChild(button);
      result.mounted = true;
      result.props = props;
    },
    async unmount(props) {
      props.domElement.querySelector("button").remove();
      result.mounted = false;
      result.props = props;
    },
    mounted: false,
    props: null,
    numUpdates: 0,
  };

  if (opts.update) {
    result.update = async (props) => {
      result.props = props;
      result.numUpdates++;
    };
  }

  return result;
}

function tick() {
  return new Promise((resolve) => {
    setTimeout(resolve);
  });
}

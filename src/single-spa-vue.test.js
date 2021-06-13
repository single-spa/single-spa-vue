import singleSpaVue from "./single-spa-vue";

const domElId = `single-spa-application:test-app`;
const cssSelector = `#single-spa-application\\:test-app`;

describe("single-spa-vue", () => {
  let Vue, props, $destroy;

  beforeEach(() => {
    Vue = jest.fn();

    Vue.mockImplementation(function () {
      this.$destroy = $destroy;
      this.$el = { innerHTML: "" };
    });

    props = { name: "test-app" };

    $destroy = jest.fn();
  });

  afterEach(() => {
    document.querySelectorAll(cssSelector).forEach((node) => {
      node.remove();
    });
  });

  it(`calls new Vue() during mount and mountedInstances.instance.$destroy() on unmount`, () => {
    const handleInstance = jest.fn();

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
      handleInstance,
    });

    return lifecycles
      .bootstrap(props)
      .then(() => {
        expect(Vue).not.toHaveBeenCalled();
        expect(handleInstance).not.toHaveBeenCalled();
        expect($destroy).not.toHaveBeenCalled();
        return lifecycles.mount(props);
      })
      .then(() => {
        expect(Vue).toHaveBeenCalled();
        expect(handleInstance).toHaveBeenCalled();
        expect($destroy).not.toHaveBeenCalled();
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect($destroy).toHaveBeenCalled();
      });
  });

  it(`creates a dom element container for you if you don't provide one`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
    });

    expect(document.getElementById(domElId)).toBe(null);

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(document.getElementById(domElId)).toBeTruthy();
      });
  });

  it(`uses the appOptions.el selector string if provided, and wraps the single-spa application in a container div`, () => {
    document.body.appendChild(
      Object.assign(document.createElement("div"), {
        id: "my-custom-el",
      })
    );

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: "#my-custom-el",
      },
    });

    expect(document.querySelector(`#my-custom-el .single-spa-container`)).toBe(
      null
    );

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(
          document.querySelector(`#my-custom-el .single-spa-container`)
        ).toBeTruthy();

        document.querySelector("#my-custom-el").remove();
      });
  });

  it(`uses the appOptions.el domElement (with id) if provided, and wraps the single-spa application in a container div`, () => {
    const domEl = Object.assign(document.createElement("div"), {
      id: "my-custom-el-2",
    });

    document.body.appendChild(domEl);

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: domEl,
      },
    });

    expect(
      document.querySelector(`#my-custom-el-2 .single-spa-container`)
    ).toBe(null);

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(Vue).toHaveBeenCalled();
        expect(Vue.mock.calls[0][0].el).toBe(
          "#my-custom-el-2 .single-spa-container"
        );
        expect(Vue.mock.calls[0][0].data()).toEqual({
          name: "test-app",
        });
      })
      .then(() => {
        expect(
          document.querySelector(`#my-custom-el-2 .single-spa-container`)
        ).toBeTruthy();
        domEl.remove();
      });
  });

  it(`uses the appOptions.el domElement (without id) if provided, and wraps the single-spa application in a container div`, () => {
    const domEl = document.createElement("div");

    document.body.appendChild(domEl);

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: domEl,
      },
    });

    const htmlId = CSS.escape("single-spa-application:test-app");

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(Vue.mock.calls[0][0].el).toBe(
          `#${htmlId} .single-spa-container`
        );
        expect(Vue.mock.calls[0][0].data()).toEqual({
          name: "test-app",
        });
      })
      .then(() => {
        expect(
          document.querySelector(`#${htmlId} .single-spa-container`)
        ).toBeTruthy();
        domEl.remove();
      });
  });

  it(`throws an error if appOptions.el is not passed in as a string or dom element`, () => {
    expect(() => {
      new singleSpaVue({
        Vue,
        appOptions: {
          // `el` should be a string or DOM Element
          el: 1233,
        },
      });
    }).toThrow(/must be a string CSS selector/);
  });

  it(`throws an error if appOptions.el doesn't exist in the dom`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: "#doesnt-exist-in-dom",
      },
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        fail("should throw validation error");
      })
      .catch((err) => {
        expect(err.message).toMatch("the dom element must exist in the dom");
      });
  });

  it(`reuses the default dom element container on the second mount`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
    });

    expect(document.querySelectorAll(cssSelector).length).toBe(0);

    let firstEl;

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(document.querySelectorAll(cssSelector).length).toBe(1);
        firstEl = Vue.mock.calls[0].el;
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect(document.querySelectorAll(cssSelector).length).toBe(1);
        Vue.mockReset();
        return lifecycles.mount(props);
      })
      .then(() => {
        expect(document.querySelectorAll(cssSelector).length).toBe(1);
        let secondEl = Vue.mock.calls[0].el;
        expect(firstEl).toBe(secondEl);
      });
  });

  it(`passes appOptions straight through to Vue`, () => {
    const appOptions = {
      something: "random",
    };
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions,
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(Vue).toHaveBeenCalled();
        expect(Vue.mock.calls[0][0].something).toBeTruthy();
        return lifecycles.unmount(props);
      });
  });

  it(`resolves appOptions from Promise and passes straight through to Vue`, () => {
    const appOptions = () =>
      Promise.resolve({
        something: "random",
      });

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions,
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(Vue).toHaveBeenCalled();
        expect(Vue.mock.calls[0][0].something).toBeTruthy();
        return lifecycles.unmount(props);
      });
  });

  it(`appOptions function will recieve the props provided at mount`, () => {
    const appOptions = jest.fn((props) =>
      Promise.resolve({
        props,
      })
    );

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions,
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(appOptions.mock.calls[0][0]).toBe(props);
        return lifecycles.unmount(props);
      });
  });

  it("`handleInstance` function will recieve the props provided at mount", () => {
    const handleInstance = jest.fn();
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
      handleInstance,
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(handleInstance.mock.calls[0][1]).toBe(props);
        return lifecycles.unmount(props);
      });
  });

  it(`implements a render function for you if you provide loadRootComponent`, () => {
    const opts = {
      Vue,
      appOptions: {},
      loadRootComponent: jest.fn(),
    };

    opts.loadRootComponent.mockReturnValue(Promise.resolve({}));

    const lifecycles = new singleSpaVue(opts);

    return lifecycles
      .bootstrap(props)
      .then(() => {
        expect(opts.loadRootComponent).toHaveBeenCalled();
        return lifecycles.mount(props);
      })
      .then(() => {
        expect(Vue.mock.calls[0][0].render).toBeDefined();
        return lifecycles.unmount(props);
      });
  });

  it(`adds the single-spa props as data to the root component`, () => {
    props.someCustomThing = "hi";

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(Vue).toHaveBeenCalled();
        expect(Vue.mock.calls[0][0].data()).toBeTruthy();
        expect(Vue.mock.calls[0][0].data().name).toBe("test-app");
        expect(Vue.mock.calls[0][0].data().someCustomThing).toBe("hi");
        return lifecycles.unmount(props);
      });
  });

  it(`mounts into the single-spa-container div if you don't provide an 'el' in appOptions`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(Vue).toHaveBeenCalled();
        expect(Vue.mock.calls[0][0].el).toBe(
          cssSelector + " .single-spa-container"
        );
        return lifecycles.unmount(props);
      });
  });

  it(`mounts will return promise with vue instance`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
    });
    return lifecycles
      .bootstrap(props)
      .then(() =>
        lifecycles.mount(props).then((instance) => {
          expect(Vue).toHaveBeenCalled();
          expect(instance instanceof Vue).toBeTruthy();
        })
      )
      .then(() => {
        return lifecycles.unmount(props);
      });
  });

  it(`mounts 2 instances and then unmounts them`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
    });

    let obj1 = {
      props: props,
      spy: null,
    };
    let obj2 = {
      props: { name: "test-app-2" },
      spy: null,
    };

    function mount(obj) {
      return lifecycles.mount(obj.props).then((instance) => {
        expect(instance instanceof Vue).toBeTruthy();

        // since $destroy is always pointing to the same function (as it is defined it beforeEach()),
        // it is needed to be overwritten
        const oldDestroy = instance.$destroy;
        instance.$destroy = (...args) => {
          return oldDestroy.apply(instance, args);
        };

        obj.spy = jest.spyOn(instance, "$destroy");
      });
    }

    function unmount(obj) {
      expect(obj.spy).not.toBeCalled();
      return lifecycles.unmount(obj.props).then(() => {
        expect(obj.spy).toBeCalled();
      });
    }

    return lifecycles
      .bootstrap(props)
      .then(() => {
        return mount(obj1);
      })
      .then(() => {
        return mount(obj2);
      })
      .then(() => {
        return unmount(obj1);
      })
      .then(() => {
        return unmount(obj2);
      });
  });

  it(`works with Vue 3 when you provide the full Vue module as an opt`, async () => {
    Vue = {
      createApp: jest.fn(),
    };

    const appMock = jest.fn();
    appMock.mount = jest.fn();
    appMock.unmount = jest.fn();

    window.appMock = appMock;

    Vue.createApp.mockReturnValue(appMock);

    const props = { name: "vue3-app" };

    const handleInstance = jest.fn();

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {},
      handleInstance,
    });

    await lifecycles.bootstrap(props);
    await lifecycles.mount(props);

    expect(Vue.createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof Vue.createApp.mock.calls[0][0].data).toBe("function");
    expect(handleInstance).toHaveBeenCalledWith(appMock, props);
    expect(appMock.mount).toHaveBeenCalled();

    await lifecycles.unmount(props);
    expect(appMock.unmount).toHaveBeenCalled();
  });

  it(`works with Vue 3 when you provide the createApp function opt`, async () => {
    const createApp = jest.fn();

    const appMock = jest.fn();
    appMock.mount = jest.fn();
    appMock.unmount = jest.fn();

    window.appMock = appMock;

    createApp.mockReturnValue(appMock);

    const props = { name: "vue3-app" };

    const handleInstance = jest.fn();

    const lifecycles = new singleSpaVue({
      createApp,
      appOptions: {},
      handleInstance,
    });

    await lifecycles.bootstrap(props);
    await lifecycles.mount(props);

    expect(createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof createApp.mock.calls[0][0].data).toBe("function");
    expect(handleInstance).toHaveBeenCalledWith(appMock, props);
    expect(appMock.mount).toHaveBeenCalled();

    await lifecycles.unmount(props);
    expect(appMock.unmount).toHaveBeenCalled();
  });

  it(`mounts a Vue instance in specified element, if replaceMode is true`, () => {
    const domEl = document.createElement("div");
    const htmlId = CSS.escape("single-spa-application:test-app");

    document.body.appendChild(domEl);

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: domEl,
      },
      replaceMode: true,
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => expect(Vue.mock.calls[0][0].el).toBe(`#${htmlId}`))
      .then(() => {
        expect(document.querySelector(`#${htmlId}`)).toBeTruthy();
        domEl.remove();
      });
  });

  it(`mounts a Vue instance with ' .single-spa-container' if replaceMode is false or not provided`, () => {
    const domEl = document.createElement("div");
    const htmlId = CSS.escape("single-spa-application:test-app");

    document.body.appendChild(domEl);

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: domEl,
      },
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() =>
        expect(Vue.mock.calls[0][0].el).toBe(`#${htmlId} .single-spa-container`)
      )
      .then(() => {
        expect(
          document.querySelector(`#${htmlId} .single-spa-container`)
        ).toBeTruthy();
        domEl.remove();
      });
  });
});

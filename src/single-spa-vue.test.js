import singleSpaVue from "./single-spa-vue";

const domElId = `single-spa-application:test-app`;
const cssSelector = `#single-spa-application\\:test-app`;

describe("single-spa-vue", () => {
  let Vue, props, $destroy;

  beforeEach(() => {
    Vue = jest.fn();

    Vue.mockImplementation(function() {
      this.$destroy = $destroy;
      this.$el = { innerHTML: "" };
    });

    props = { name: "test-app" };

    $destroy = jest.fn();
  });

  afterEach(() => {
    document.querySelectorAll(cssSelector).forEach(node => {
      node.remove();
    });
  });

  it(`calls new Vue() during mount and mountedInstances.instance.$destroy() on unmount`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {}
    });

    return lifecycles
      .bootstrap(props)
      .then(() => {
        expect(Vue).not.toHaveBeenCalled();
        expect($destroy).not.toHaveBeenCalled();
        return lifecycles.mount(props);
      })
      .then(() => {
        expect(Vue).toHaveBeenCalled();
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
      appOptions: {}
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
        id: "my-custom-el"
      })
    );

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: "#my-custom-el"
      }
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

  it(`uses the appOptions.el domElement if provided, and wraps the single-spa application in a container div`, () => {
    const domEl = Object.assign(document.createElement("div"), {
      id: "my-custom-el-2"
    });

    document.body.appendChild(domEl);

    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: domEl
      }
    });

    expect(
      document.querySelector(`#my-custom-el-2 .single-spa-container`)
    ).toBe(null);

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(
          document.querySelector(`#my-custom-el-2 .single-spa-container`)
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
          el: 1233
        }
      });
    }).toThrow(/must be a string CSS selector/);
  });

  it(`throws an error if appOptions.el doesn't exist in the dom`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {
        el: "#doesnt-exist-in-dom"
      }
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        fail("should throw validation error");
      })
      .catch(err => {
        expect(err.message).toMatch("the dom element must exist in the dom");
      });
  });

  it(`reuses the default dom element container on the second mount`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {}
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
      something: "random"
    };
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions
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

  it(`implements a render function for you if you provide loadRootComponent`, () => {
    const opts = {
      Vue,
      appOptions: {},
      loadRootComponent: jest.fn()
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
      appOptions: {}
    });

    return lifecycles
      .bootstrap(props)
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(Vue).toHaveBeenCalled();
        expect(Vue.mock.calls[0][0].data).toBeTruthy();
        expect(Vue.mock.calls[0][0].data.name).toBe("test-app");
        expect(Vue.mock.calls[0][0].data.someCustomThing).toBe("hi");
        return lifecycles.unmount(props);
      });
  });

  it(`mounts into the single-spa-container div if you don't provide an 'el' in appOptions`, () => {
    const lifecycles = new singleSpaVue({
      Vue,
      appOptions: {}
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
      appOptions: {}
    });
    return lifecycles
      .bootstrap(props)
      .then(() =>
        lifecycles.mount(props).then(instance => {
          expect(Vue).toHaveBeenCalled();
          expect(instance instanceof Vue).toBeTruthy();
        })
      )
      .then(() => {
        return lifecycles.unmount(props);
      });
  });
});

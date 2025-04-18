import { AppProps, LifeCycles } from "single-spa";
import { App, Component, createApp, createSSRApp } from "vue";
import type { Component as Vue2Component } from "vue2";
import {
  chooseDomElementGetter,
  DomElementGetterOpts,
} from "dom-element-getter-helpers";

const defaultOpts = {
  // required opts
  rootComponent: null,
  appOptions: null,

  // sometimes require opts
  Vue: null,
  handleInstance: null,
};

type SingleSpaVueOptions<ExtraProps> =
  | SingleSpaVue2Options<ExtraProps>
  | SingleSpaVue3Options<ExtraProps>;

interface SingleSpaVue3Options<ExtraProps> extends DomElementGetterOpts {
  rootComponent:
    | Component<ExtraProps>
    | ((props: AppProps & ExtraProps) => Promise<Component<ExtraProps>>);
  createApp: typeof createApp | typeof createSSRApp;
  customizeInstance(app: App): void;
}

interface SingleSpaVue2Options<ExtraProps> extends DomElementGetterOpts {
  // Vue 2 not installed as a dependency
  Vue: any;
  rootComponent:
    | Vue2Component<ExtraProps>
    | ((props: AppProps & ExtraProps) => Promise<Vue2Component<ExtraProps>>);
}

export function singleSpaVue<ExtraProps>(
  opts: SingleSpaVueOptions<ExtraProps>,
): LifeCycles<ExtraProps> {
  if (opts["createApp"]) {
    let RootComponent: Vue2Component;

    return {
      async bootstrap(props) {
        if (typeof opts.rootComponent === "function") {
          RootComponent = await (opts.rootComponent as Function)(props);
        } else {
          RootComponent = opts.rootComponent as Vue2Component;
        }
      },
      async mount(props) {},
      async update(props) {},
      async unmount(props) {},
    };
  } else {
    const vue3Opts = opts as SingleSpaVue3Options<ExtraProps>;
    const mountedInstances: Record<string, App> = {};
    let RootComponent: Component<AppProps & ExtraProps>;

    return {
      async bootstrap(props) {
        if (typeof vue3Opts.rootComponent === "function") {
          RootComponent = await (vue3Opts.rootComponent as Function)(props);
        } else {
          RootComponent = vue3Opts.rootComponent as Component;
        }
      },
      async mount(props) {
        const app = createApp(RootComponent, props);
        if (vue3Opts["customizeInstance"]) {
          vue3Opts.customizeInstance(app);
        }
        const domElement = chooseDomElementGetter(vue3Opts, props)();
        app.mount(domElement);
        mountedInstances[props.name] = app;
      },
      async update(props) {},
      async unmount(props) {
        const app = mountedInstances[props.name];
        return app!.unmount();
      },
    };
  }
}

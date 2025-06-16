import type { AppProps, LifeCycles } from "single-spa";
import type { App, Component, createApp, createSSRApp } from "vue";
import {
  chooseDomElementGetter,
  DomElementGetterOpts,
} from "dom-element-getter-helpers";

interface SingleSpaVueOptions<ExtraProps> extends DomElementGetterOpts {
  rootComponent:
    | Component<ExtraProps>
    | ((props: AppProps & ExtraProps) => Promise<Component<ExtraProps>>);
  createApp: typeof createApp | typeof createSSRApp;
  setupInstance?(app: App): void;
}

export default function singleSpaVue<ExtraProps>(
  opts: SingleSpaVueOptions<ExtraProps>,
): LifeCycles<ExtraProps> {
  if (!opts) {
    err(`opts required`);
  }

  if (!opts.rootComponent) {
    err(`opts.rootComponent required`);
  }

  if (typeof opts.createApp !== "function") {
    err(`opts.createApp must be a function`);
  }

  const mountedInstances: Record<string, App> = {};
  let RootComponent: Component<AppProps & ExtraProps>;

  return {
    async init(props) {
      if (typeof opts.rootComponent === "function") {
        RootComponent = await (opts.rootComponent as Function)(props);
      } else {
        RootComponent = opts.rootComponent as Component;
      }

      // https://vuejs.org/api/options-misc.html#inheritattrs
      // The single-spa props should not be inherited as DOM attributes
      // @ts-ignore
      RootComponent.inheritAttrs = false;
    },
    async mount(props) {
      const app = opts.createApp(RootComponent, props);
      if (opts["setupInstance"]) {
        opts.setupInstance(app);
      }
      const domElement = chooseDomElementGetter(opts, props)();
      app.mount(domElement);
      mountedInstances[props.name] = app;
    },
    async update(props) {},
    async unmount(props) {
      const app = mountedInstances[props.name];
      app!.unmount();
      const domElement = chooseDomElementGetter(opts, props)();
      domElement.remove();
      delete mountedInstances[props.name];
    },
  };
}

function err(msg) {
  throw Error(`single-spa-vue: ${msg}`);
}

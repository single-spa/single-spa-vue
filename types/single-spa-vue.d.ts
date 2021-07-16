declare module "single-spa-vue" {
  export default function singleSpaVue(
    opts: SingleSpaVueOpts
  ): SingleSpaVueLifecycles;

  type AppOptions = {
    el?: string | HTMLElement;
    data?: any;
    [key: string]: any;
  };

  interface BaseSingleSpaVueOptions {
    appOptions:
      | AppOptions
      | ((
          opts: SingleSpaOptsVue2 | SingleSpaOptsVue3,
          props: object
        ) => Promise<AppOptions>);
    template?: string;
    loadRootComponent?(): Promise<any>;
  }

  type SingleSpaOptsVue2 = BaseSingleSpaVueOptions & {
    Vue: any;
  };

  type SingleSpaOptsVue3 = BaseSingleSpaVueOptions & {
    createApp: any;
    handleInstance?(instance: any, props: object): void;
  };

  type SingleSpaVueOpts = SingleSpaOptsVue2 | SingleSpaOptsVue3;

  type SingleSpaVueLifecycles = {
    bootstrap(singleSpaProps: SingleSpaProps): Promise<any>;
    mount(singleSpaProps: SingleSpaProps): Promise<any>;
    unmount(singleSpaProps: SingleSpaProps): Promise<any>;
    update(singleSpaProps: SingleSpaProps): Promise<any>;
  };

  type SingleSpaProps = object;
}

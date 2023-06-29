declare module "single-spa-vue" {
  import { AppProps } from "single-spa";

  export default function singleSpaVue(
    opts: SingleSpaVueOpts
  ): SingleSpaVueLifecycles;

  type AppOptions = {
    el?: string | HTMLElement;
    data?: any;
    render?: (this: AppProps) => any;
    [key: string]: any;
  };

  interface BaseSingleSpaVueOptions {
    appOptions:
      | AppOptions
      | AppProps
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
    createApp(appOptions: AppOptions): any;
    handleInstance?(instance: any, props: object): void | Promise<void>;
    replaceMode?: boolean;
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

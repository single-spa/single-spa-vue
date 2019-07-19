declare module "single-spa-vue" {
  export default function singleSpaVue(opts: SingleSpaVueOpts): SingleSpaVueLifecycles;

  type SingleSpaVueOpts = {
    Vue: any;
    appOptions: object;
    template: string;
  }

  type SingleSpaVueLifecycles = {
    bootstrap(singleSpaProps: SingleSpaProps): Promise;
    mount(singleSpaProps: SingleSpaProps): Promise;
    unmount(singleSpaProps: SingleSpaProps): Promise;
    update(singleSpaProps: SingleSpaProps): Promise;
  }

  type SingleSpaProps = object;
}
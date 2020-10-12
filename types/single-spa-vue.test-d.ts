import "..";
import singleSpaVue, {
  SingleSpaVueOpts,
  SingleSpaOptsVue2,
  SingleSpaOptsVue3
} from "single-spa-vue";
import { expectAssignable } from "tsd";

const Vue = () => {};
const appOptions = {};

const optsVue2: SingleSpaOptsVue2 = {
  Vue,
  appOptions
};
expectAssignable<SingleSpaVueOpts>(optsVue2);
singleSpaVue(optsVue2);

const createApp = () => {};
const optsVue3: SingleSpaOptsVue3 = {
  createApp,
  appOptions,
  handleInstance: (instance: any) => {}
};
expectAssignable<SingleSpaVueOpts>(optsVue3);
singleSpaVue(optsVue3);

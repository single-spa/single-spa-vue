# single-spa-vuejs

Generic lifecycle hooks for Vue.js applications that are registered as [applications](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#registered-applications) of [single-spa](https://github.com/CanopyTax/single-spa).

## Example
In addition to this Readme, example usage of single-spa-vue can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/vue/vue.app.js) project.

## Quickstart

First, in the [single-spa application](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#registered-applications), run `npm install --save single-spa-vue`. Note you can also use
single-spa-vue by adding `<script src="https://unpkg.com/single-spa-vue"></script>` to your html file and accessing the `singleSpaVue` global variable.

Then, add the following to your application's entry file

```js
import Vue from 'vue';
import singleSpaVue from 'single-spa-vue';

const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    el: '#mount-location',
    template: '<div>some template</div>'
  }  
});

export const bootstrap = [
  vueLifecycles.bootstrap,
];

export const mount = [
  vueLifecycles.mount,
];

export const unmount = [
  vueLifecycles.unmount,
];
```

## Options

All options are passed to single-spa-vue via the `opts` parameter when calling `singleSpaVue(opts)`. The following options are available:

- `Vue`: (required) The main Vue object, which is generally either exposed onto the window or is available via `require('vue')` `import Vue from 'vue'`.
- `appOptions`: (required) An object which will be used to instantiate your Vue.js application. `appOptions` will pass directly through to `new Vue(appOptions)`

## As a single-spa parcel
To create a single-spa parcel, simply omit the `el` option from your appOptions, since the dom element will be specified by the user of the Parcel. Everything other
option should be provided exactly the same as in the example above.

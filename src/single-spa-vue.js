const defaultOpts = {
  // required opts
  Vue: null,
  appOptions: null,
  template: null,
}

export default function singleSpaVue(userOpts) {
  if (typeof userOpts !== 'object') {
    throw new Error(`single-spa-vue requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.Vue) {
    throw new Error('single-spa-vuejs must be passed opts.Vue');
  }

  if (!opts.appOptions) {
    throw new Error('single-spa-vuejs must be passed opts.appOptions');
  }

  // Just a shared object to store the mounted object state
  let mountedInstances = {};

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
  };
}

function bootstrap(opts) {
  return Promise.resolve();
}

function mount(opts, mountedInstances, props) {
  return Promise
    .resolve()
    .then(() => {
      const otherOptions = {}
      if (props.domElement && !opts.appOptions.el) {
        otherOptions.el = props.domElement;
      }

      const options = {
        ...opts.appOptions,
        ...otherOptions,
        data: {
          ...(opts.appOptions.data || {}),
          ...props,
        },
      }

      mountedInstances.instance = new opts.Vue(options);
      if (mountedInstances.instance.bind) {
        mountedInstances.instance = mountedInstances.instance.bind(mountedInstances.instance);
      }
    })
}

function unmount(opts, mountedInstances) {
  return Promise
    .resolve()
    .then(() => {
      mountedInstances.instance.$destroy();
      mountedInstances.instance.$el.innerHTML = '';
      delete mountedInstances.instance;
    })
}

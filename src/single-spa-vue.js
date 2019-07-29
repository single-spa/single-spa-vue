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
    update: update.bind(null, opts, mountedInstances),
  };
}

function bootstrap(opts) {
  if (opts.loadRootComponent) {
    return opts.loadRootComponent().then(root => opts.rootComponent = root)
  } else {
    return Promise.resolve();
  }
}

function mount(opts, mountedInstances, props) {
  return Promise
    .resolve()
    .then(() => {
      if (props.domElement && !opts.appOptions.el) {
        opts.appOptions.el = props.domElement;
      }

      if (!opts.appOptions.el) {
        const htmlId = `single-spa-application:${props.name}`
        opts.appOptions.el = `#${htmlId.replace(':', '\\:')}`
        let domEl = document.getElementById(htmlId)
        if (!domEl) {
          domEl = document.createElement('div')
          domEl.id = htmlId
          document.body.appendChild(domEl)
        }
      }

      if (!opts.appOptions.render && !opts.appOptions.template && opts.rootComponent) {
        opts.appOptions.render = (h) => h(opts.rootComponent)
      }

      if (!opts.appOptions.data) {
        opts.appOptions.data = {}
      }

      opts.appOptions.data = {...opts.appOptions.data, ...props}

      mountedInstances.instance = new opts.Vue(opts.appOptions);
      if (mountedInstances.instance.bind) {
        mountedInstances.instance = mountedInstances.instance.bind(mountedInstances.instance);
      }
    })
}

function update(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    const data = {
      ...(opts.appOptions.data || {}),
      ...props,
    };
    for (let prop in data) {
      mountedInstances.instance[prop] = data[prop];
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

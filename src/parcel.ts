import * as Vue from "vue";

const lessThanVue3 = !Vue.version || /^[012]\..+/.test(Vue.version);

export default {
  props: {
    config: [Object, Promise],
    wrapWith: String,
    wrapClass: String,
    wrapStyle: Object,
    mountParcel: Function,
    parcelProps: Object,
  },
  render(h) {
    // Vue 2 works differently than Vue 3
    h = typeof h === "function" ? h : Vue.h || (Vue.default && Vue.default.h);

    const containerTagName = this.wrapWith || "div";
    const props = { ref: "container" };
    if (this.wrapClass) {
      props.class = this.wrapClass;
    }
    if (this.wrapStyle) {
      props.style = this.wrapStyle;
    }
    return h(containerTagName, props);
  },
  data() {
    return {
      hasError: false,
    };
  },
  methods: {
    addThingToDo(action, thing) {
      if (this.hasError && action !== "unmount") {
        return;
      }

      this.nextThingToDo = (this.nextThingToDo || Promise.resolve())
        .then((...args) => {
          if (this.unmounted && action !== "unmount") {
            return;
          }

          return thing.apply(this, args);
        })
        .catch((err) => {
          this.nextThingToDo = Promise.resolve();
          this.hasError = true;

          if (err && err.message) {
            err.message = `During '${action}', parcel threw an error: ${err.message}`;
          }

          this.$emit("parcelError", err);

          throw err;
        });
    },
    singleSpaMount() {
      this.parcel = this.mountParcel(this.config, this.getParcelProps());

      return this.parcel.mountPromise.then(() => {
        this.$emit("parcelMounted");
      });
    },
    singleSpaUnmount() {
      if (this.parcel && this.parcel.getStatus() === "MOUNTED") {
        return this.parcel.unmount();
      }
    },
    singleSpaUpdate() {
      if (this.parcel && this.parcel.update) {
        return this.parcel.update(this.getParcelProps()).then(() => {
          this.$emit("parcelUpdated");
        });
      }
    },
    getParcelProps() {
      return {
        domElement: this.$refs.container,
        ...(this.parcelProps || {}),
      };
    },
  },
  mounted() {
    if (!this.config) {
      throw Error(`single-spa-vue: <parcel> component requires a config prop.`);
    }

    if (!this.mountParcel) {
      throw Error(
        `single-spa-vue: <parcel> component requires a mountParcel prop`,
      );
    }

    if (this.config) {
      this.addThingToDo("mount", this.singleSpaMount);
    }
  },
  [lessThanVue3 ? "destroyed" : "unmounted"]() {
    this.addThingToDo("unmount", this.singleSpaUnmount);
  },
  watch: {
    parcelProps: {
      handler(parcelProps) {
        this.addThingToDo("update", this.singleSpaUpdate);
      },
    },
  },
};

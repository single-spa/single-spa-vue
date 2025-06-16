import type {
  mountRootParcel,
  Parcel as SingleSpaParcel,
  ParcelConfig,
} from "single-spa";
import { Component, ComponentPublicInstance, h } from "vue";

const Parcel: Component<Props, Bindings, Data> = {
  emits: ["parcelMounted", "parcelUpdated", "parcelUnmounted", "parcelError"],
  props: {
    config: Object,
    mountParcel: Function,
    wrapWith: {
      type: String,
      default: "div",
    },
    wrapClass: String,
    wrapStyle: Object,
    parcelProps: {
      type: Object,
      default: {},
    },
  },
  data() {
    let currentTask: Promise<void>;

    const result: Data = {
      parcel: null,
      currentTask: Promise.resolve(),
      addTask(task, action: string) {
        currentTask = currentTask
          .then(() => task())
          .then(
            () => {
              this.$emit(action);
            },
            (err) => {
              setTimeout(() => {
                console.error(
                  `Error ${action} single-spa parcel within single-spa-vue's Parcel component`,
                );
                throw err;
              });
            },
          );
      },
    };

    return result;
  },
  render(props: Props) {
    return h(this.$props.wrapWith, { ref: "wrapper" });
  },
  mounted(this: ComponentPublicInstance<Props, Bindings, Data>) {
    addTask.call(
      this,
      () => {
        this.$data.parcel = this.$props.mountParcel(this.$props.config, {
          ...this.$props.parcelProps,
          domElement: this.$refs["wrapper"],
        });
        return this.$data.parcel.mountPromise;
      },
      "parcelMounted",
    );
  },
  updated() {
    addTask.call(
      this,
      () => {
        return this.$data.parcel.update({
          ...this.$props.parcelProps,
          domElement: this.$refs["wrapper"],
        });
      },
      "parcelUpdated",
    );
  },
  unmounted() {
    addTask.call(this, () => this.$data.parcel.unmount(), "parcelUnmounted");
  },
};

function addTask(
  this: ComponentPublicInstance<Props, Bindings, Data>,
  task: () => Promise<void>,
  action: string,
) {
  this.$data.currentTask = this.$data.currentTask
    .then(task)
    .then(() => {
      this.$emit(action);
    })
    .catch((err) => {
      console.error(`single-spa-vue: Error during ${action}`, err);
      this.$emit("parcelError", err);
    });
}

interface Props<ExtraProps = {}> {
  config: ParcelConfig;
  mountParcel: typeof mountRootParcel;
  wrapWith: string;
  wrapClass: string;
  wrapStyle: object;
  parcelProps: ExtraProps;
}

interface Bindings {}

interface Data {
  parcel: SingleSpaParcel;
  addTask(task: () => Promise<any>, action: string): void;
  currentTask: Promise<void>;
}

export default Parcel;

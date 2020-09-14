<template>
  <div ref="container" v-if="config"></div>
</template>

<script>
export default {
  props: {
    config: Object
  },
  data() {
    return {
      hasError: false
    };
  },
  methods: {
    buildParcelElement(config) {
      const { appendTo = "div", elClass, wrapStyle } = config;

      const parcelEl = document.createElement(appendTo);
      parcelEl.className = elClass;

      if (wrapStyle) {
        Object.keys(wrapStyle).forEach(key => {
          parcelEl.style[key] = wrapStyle[key];
        });
      }

      this.$refs.container.appendChild(parcelEl);
    },
    addThingToDo(action, thing) {
      if (this.hasError && action !== "unmount") {
        return;
      }

      this.nextThingToDo = (this.nextThingToDo || Promise.resolve())
        .then((...args) => {
          if (this.unmounted && action !== "unmount") {
            return;
          }

          return thing(...args);
        })
        .catch(err => {
          this.nextThingToDo = Promise.resolve();
          this.hasError = true;

          if (err && err.message) {
            err.message = `During '${action}', parcel threw an error: ${err.message}`;
          }

          if (this.handleError) {
            this.handleError(err);
          } else {
            setTimeout(() => {
              throw err;
            });
          }

          throw err;
        });
    }
  },
  mounted() {
    if (!!this.config) {
      this.addThingToDo("mount", this.buildParcelElement(this.config));
    }

    this.hasError = true;
  }
};
</script>

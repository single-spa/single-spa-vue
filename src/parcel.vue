<template>
  <div ref="container" v-if="config"></div>
</template>

<script>
export default {
  props: {
    config: Object
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
    }
  },
  mounted() {
    if (!!this.config) {
      this.buildParcelElement(this.config);
    }
  }
};
</script>

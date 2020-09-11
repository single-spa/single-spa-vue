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
      const { appendTo, elClass } = config;

      const parcelEl = document.createElement(appendTo);
      parcelEl.className = elClass;

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

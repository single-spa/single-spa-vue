<script>
export default {
  props: {
    config: Object
  },
  methods: {
    noConfig(createElement) {
      return createElement(
        "div",
        { class: "no-config" },
        "<Parcel /> was mounted without a configuration object"
      );
    }
  },
  render(createElement) {
    if (!!this.config) {
      return createElement("div", { class: "parcel-container" });
    }

    return this.noConfig(createElement);
  }
};
</script>

<template>
  <div v-if="config" class="parcel-container"></div>
</template>

<script>
export default {
  props: {
    config: Object
  }
};
</script>

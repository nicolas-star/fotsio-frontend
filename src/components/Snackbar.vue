<template>
  <transition name="snackbar">
    <n-alert
      v-if="show"
      class="snackbar"
      :title="title"
      :type="type"
      :closable="closable"
      @close="close"
    >
      {{ message }}
    </n-alert>
  </transition>
</template>

<script setup>
import { onBeforeUnmount, watch } from "vue";
import { NAlert } from "naive-ui";

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: "" },
  type: { type: String, default: "info" },
  title: { type: String, default: "" },
  duration: { type: Number, default: 3000 },
  closable: { type: Boolean, default: true },
});

const emit = defineEmits(["close"]);
let timer;

function clearTimer() {
  if (timer) window.clearTimeout(timer);
  timer = undefined;
}

function close() {
  clearTimer();
  emit("close");
}

watch(
  () => [props.show, props.message],
  ([show]) => {
    clearTimer();
    if (show && props.duration > 0)
      timer = window.setTimeout(close, props.duration);
  },
  { immediate: true },
);

onBeforeUnmount(clearTimer);
</script>

<style scoped>
.snackbar {
  position: fixed;
  top: calc(var(--safe-area-top, 0px) + 64px);
  left: var(--space-md);
  right: var(--space-md);
  z-index: 20;
}

.snackbar-enter-active,
.snackbar-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.snackbar-enter-from,
.snackbar-leave-to {
  opacity: 0;
  transform: translateY(-var(--space-sm));
}
</style>

<template>
	<div class="snackbar-stack" aria-live="polite" aria-relevant="additions">
		<transition-group name="snackbar" tag="div" class="snackbar-list">
			<n-alert
				v-for="notification in notifications"
				:key="notification.id"
				class="snackbar-item"
				:title="notification.title"
				:type="notification.type"
				:closable="notification.closable"
				@close="dismissNotification(notification.id)">
				{{ notification.message }}
			</n-alert>
		</transition-group>
	</div>
</template>

<script>
import { NAlert } from "naive-ui";
import { dismissNotification, notifications } from "../services/notifications";

export default {
	name: "Snackbar",
	components: { NAlert },
	data() {
		return { notifications };
	},
	methods: {
		dismissNotification,
	},
};
</script>

<style scoped>
.snackbar-stack {
	position: fixed;
	top: calc(var(--safe-area-top, 0px) + 64px);
	left: max(var(--safe-area-left, 0px), var(--space-md));
	right: max(var(--safe-area-right, 0px), var(--space-md));
	z-index: 1000;
	max-height: calc(
		100dvh - var(--safe-area-top, 0px) - var(--safe-area-bottom, 0px) - 88px
	);
	overflow-y: auto;
	overscroll-behavior: contain;
	pointer-events: none;
}

.snackbar-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-sm);
}

.snackbar-item {
	flex: 0 0 auto;
	box-shadow: 0 var(--space-xs) var(--space-md)
		color-mix(in srgb, var(--color-text) 18%, transparent);
	pointer-events: auto;
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

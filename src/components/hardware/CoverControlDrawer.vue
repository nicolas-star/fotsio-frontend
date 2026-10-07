<template>
	<BottomSheet
		:show="show"
		:height="height"
		:subtitle="stateLabel"
		title=""
		eyebrow="Controllo tapparella"
		haptic
		@update:show="$emit('update:show', $event)">
		<template #header>
			<div class="sheet-title">
				<span class="sheet-kicker">Controllo tapparella</span>
				<strong>{{ device?.nome || "Tapparella" }}</strong>
				<span class="sheet-status">{{ stateLabel }}</span>
			</div>
		</template>
			<div v-if="device" class="sheet-actions">
				<n-button
					type="primary"
					size="large"
					:loading="busyActions.open"
					:disabled="!canCommand"
					@click="$emit('command', 'open')">
					<template #icon><n-icon><ArrowUpOutline /></n-icon></template>
					Alza
				</n-button>
				<n-button
					size="large"
					:loading="busyActions.stop"
					:disabled="!canCommand"
					@click="$emit('command', 'stop')">
					<template #icon><n-icon><StopCircleOutline /></n-icon></template>
					Stop
				</n-button>
				<n-button
					type="warning"
					size="large"
					:loading="busyActions.close"
					:disabled="!canCommand"
					@click="$emit('command', 'close')">
					<template #icon><n-icon><ArrowDownOutline /></n-icon></template>
					Abbassa
				</n-button>
				<n-button
					size="large"
					:loading="busyActions.slats"
					:disabled="!canCommand"
					@click="$emit('command', 'open_slats')">
					<template #icon><n-icon><EllipseOutline /></n-icon></template>
					Fessure {{ slatsPercentage }}%
				</n-button>
				<n-button
					size="large"
					:loading="busyActions.position"
					:disabled="!canCommand"
					@click="$emit('set-position', 50)">
					<template #icon><n-icon><ResizeOutline /></n-icon></template>
					Apri al 50%
				</n-button>
			</div>
	</BottomSheet>
</template>

<script setup>
import { NButton, NIcon } from "naive-ui";
import BottomSheet from "../BottomSheet.vue";
import {
	ArrowDownOutline,
	ArrowUpOutline,
	EllipseOutline,
	ResizeOutline,
	StopCircleOutline,
} from "@vicons/ionicons5";

defineProps({
	show: { type: Boolean, default: false },
	height: { type: [Number, String], default: "min(82dvh, 680px)" },
	device: { type: Object, default: null },
	stateLabel: { type: String, default: "" },
	slatsPercentage: { type: Number, default: 50 },
	busyActions: {
		type: Object,
		default: () => ({ open: false, stop: false, close: false, slats: false, position: false }),
	},
	canCommand: { type: Boolean, default: false },
});

defineEmits(["update:show", "command", "set-position"]);
</script>

<style scoped>
.sheet-title {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-xs);
}

.sheet-kicker {
	color: var(--color-text-muted);
	font-weight: 700;
	line-height: 1.2;
	text-transform: uppercase;
}

.sheet-title strong {
	display: block;
	line-height: 1.2;
}

.sheet-status {
	display: inline-flex;
	align-items: center;
	margin-top: var(--space-sm);
	padding: var(--space-sm);
	border-radius: var(--radius-full);
	background: var(--color-bg-soft);
	color: var(--color-primary);
	font-weight: 700;
}

.sheet-actions {
	display: grid;
	grid-template-columns: 1fr;
	gap: var(--space-md);
}

.sheet-actions :deep(.n-button) {
	min-height: 54px;
}

</style>

<template>
	<n-drawer
		:show="show"
		placement="bottom"
		:height="height"
		:mask-closable="maskClosable"
		class="shared-bottom-sheet"
		:style="sheetStyle"
		@update:show="$emit('update:show', $event)">
		<n-drawer-content :closable="closable">
			<template #header>
				<slot name="header">
					<div class="sheet-heading">
						<span v-if="eyebrow" class="sheet-eyebrow">{{ eyebrow }}</span>
						<strong class="sheet-title">{{ title }}</strong>
						<span v-if="subtitle" class="sheet-subtitle">{{ subtitle }}</span>
					</div>
				</slot>
			</template>
			<template v-if="$slots['header-extra']" #header-extra>
				<slot name="header-extra" />
			</template>
			<div class="sheet-content">
				<slot />
			</div>
		</n-drawer-content>
	</n-drawer>
</template>

<script setup>
import { computed, watch } from "vue";
import { NDrawer, NDrawerContent } from "naive-ui";

const props = defineProps({
	show: { type: Boolean, default: false },
	title: { type: String, default: "" },
	subtitle: { type: String, default: "" },
	eyebrow: { type: String, default: "" },
	height: { type: [Number, String], default: "min(82dvh, 680px)" },
	closable: { type: Boolean, default: true },
	maskClosable: { type: Boolean, default: true },
	contentPadding: { type: String, default: "var(--space-md)" },
	contentBottomPadding: { type: String, default: "var(--space-lg)" },
	headerPadding: { type: String, default: "var(--space-lg) var(--space-md) var(--space-md)" },
	titleSize: { type: String, default: "var(--font-size-lg, 1.25rem)" },
	haptic: { type: Boolean, default: false },
});

defineEmits(["update:show"]);

const sheetStyle = computed(() => ({
	"--sheet-content-padding": props.contentPadding,
	"--sheet-content-bottom-padding": props.contentBottomPadding,
	"--sheet-header-padding": props.headerPadding,
	"--sheet-title-size": props.titleSize,
}));

watch(
	() => props.show,
	(isOpen) => {
		if (!isOpen || !props.haptic || typeof navigator === "undefined") return;
		try {
			navigator.vibrate?.(15);
		} catch {
			// Haptics are optional and may be blocked by the browser.
		}
	},
);
</script>

<style scoped>
.sheet-heading {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-xs);
}

.sheet-eyebrow {
	color: var(--color-text-muted);
	font-weight: 700;
	line-height: 1.2;
	text-transform: uppercase;
}

.sheet-title {
	font-size: var(--sheet-title-size);
	line-height: 1.2;
}

.sheet-subtitle {
	color: var(--color-text-muted);
}

:deep(.n-drawer-mask) {
	background: color-mix(in srgb, var(--color-text) 42%, transparent);
}

:deep(.n-drawer) {
	box-shadow: 0 calc(-1 * var(--space-lg)) var(--space-xxl)
		color-mix(in srgb, var(--color-text) 28%, transparent);
}

:deep(.n-drawer-content) {
	border-radius: var(--radius-lg) var(--radius-lg) 0 0;
	overflow: hidden;
}

:deep(.n-drawer-header) {
	border-bottom: 1px solid var(--color-border);
	padding: var(--sheet-header-padding);
}

.sheet-content {
	padding: var(--sheet-content-padding);
	padding-bottom: calc(
		var(--sheet-content-bottom-padding) + var(--safe-area-bottom, 0px)
	);
}
</style>
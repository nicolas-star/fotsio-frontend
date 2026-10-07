<template>
	<nav v-if="showTabBar" class="tab-bar glass-surface">
		<router-link to="/" class="tab-item" active-class="active">
			<span class="tab-icon"><n-icon :size="22" aria-hidden="true"><HomeOutline /></n-icon></span>
			<span class="tab-label">Home</span>
		</router-link>

		<router-link to="/domotica" class="tab-item" active-class="active">
			<span class="tab-icon"><n-icon :size="22" aria-hidden="true"><HardwareChipOutline /></n-icon></span>
			<span class="tab-label">Domotica</span>
		</router-link>

		<router-link to="/spesa" class="tab-item" active-class="active">
			<span class="tab-icon"><n-icon :size="22" aria-hidden="true"><WalletOutline /></n-icon></span>
			<span class="tab-label">Finanze</span>
		</router-link>

		<router-link to="/profile" class="tab-item" active-class="active">
			<span class="tab-icon"><n-icon :size="22" aria-hidden="true"><PersonOutline /></n-icon></span>
			<span class="tab-label">Profilo</span>
		</router-link>
	</nav>
</template>

<script>
import { NIcon } from "naive-ui";
import { useAuthStore } from "../store/auth";
import {
	HomeOutline,
	HardwareChipOutline,
	WalletOutline,
	PersonOutline,
} from "@vicons/ionicons5";
// Register e JoinFamily restano conservati ma non sono più route attive.

export default {
	name: "TabBar",
	components: {
		NIcon,
		HomeOutline,
		HardwareChipOutline,
		WalletOutline,
		PersonOutline,
	},
	computed: {
		showTabBar() {
			const authStore = useAuthStore();
			const hideOnRoutes = ["Login"];
			// Register e JoinFamily restano esclusi dal router per un eventuale ripristino.
			return (
				authStore.isAuthenticated && !hideOnRoutes.includes(this.$route.name)
			);
		},
	},
};
</script>

<style scoped>
.tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: calc(110px + var(--safe-area-bottom, 0px) + var(--space-sm));
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: var(--space-sm) var(--space-xs)
		calc(var(--space-xl) + var(--safe-area-bottom, 0px));
	border-top: 1px solid var(--color-border);
	z-index: 1000;
}

.tab-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-decoration: none;
	color: var(--color-text-muted);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	padding: var(--space-sm) var(--space-xs);
	border-radius: var(--radius-md);
	flex: 1;
}

.tab-icon {
	font-size: 22px;
	line-height: 1;
	opacity: 0.7;
}

.tab-label {
	font-size: 11px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0;
}

.tab-item.active {
	color: var(--color-primary);
}

.tab-item.active .tab-icon {
	opacity: 1;
	transform: translateY(-2px);
}

</style>

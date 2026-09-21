<template>
	<nav v-if="showTabBar" class="tab-bar glass-effect">
		<router-link to="/" class="tab-item" active-class="active">
			<span class="tab-icon">🏠</span>
			<span class="tab-label">Home</span>
		</router-link>

		<router-link to="/domotica" class="tab-item" active-class="active">
			<span class="tab-icon">🔌</span>
			<span class="tab-label">Domotica</span>
		</router-link>

		<router-link to="/spesa" class="tab-item" active-class="active">
			<span class="tab-icon">💰</span>
			<span class="tab-label">Finanze</span>
		</router-link>

		<router-link to="/profile" class="tab-item" active-class="active">
			<span class="tab-icon">👤</span>
			<span class="tab-label">Profilo</span>
		</router-link>
	</nav>
</template>

<script>
import { useAuthStore } from "../store/auth";
// Register e JoinFamily restano conservati ma non sono più route attive.

export default {
	name: "TabBar",
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
	height: calc(70px + var(--safe-area-bottom) + var(--space-sm));
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding-bottom: calc(var(--safe-area-bottom) + var(--space-sm));
	border-top: 1px solid var(--color-border);
	z-index: 1000;
	background: var(--color-bg-soft);
}

.tab-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-decoration: none;
	color: var(--color-text-muted);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	padding: 8px 12px;
	border-radius: 16px;
	flex: 1;
}

.tab-icon {
	font-size: 22px;
	margin-bottom: 4px;
	filter: grayscale(1);
	opacity: 0.7;
}

.tab-label {
	font-size: 11px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.tab-item.active {
	color: var(--color-primary);
}

.tab-item.active .tab-icon {
	filter: grayscale(0);
	opacity: 1;
	transform: translateY(-2px);
}

/* Glassmorphism adjustment for tab bar */
.glass-effect {
	backdrop-filter: blur(25px);
	-webkit-backdrop-filter: blur(25px);
}
</style>

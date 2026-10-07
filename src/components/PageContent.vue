<template>
	<main class="page-content">
		<slot />
	</main>
</template>

<style scoped>
.page-content {
	min-width: 0;
	padding: var(--space-lg) var(--space-md) var(--space-xxl);
}
</style>

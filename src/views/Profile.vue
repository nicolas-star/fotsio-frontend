<template>
	<div>
		<Header title="Profilo" show-logout />
		<PageContent>
			<n-space v-if="loading" vertical size="large">
				<n-card :bordered="false"><n-skeleton text :repeat="3" /></n-card>
				<n-card :bordered="false"><n-skeleton text :repeat="2" /></n-card>
			</n-space>

			<n-space v-else vertical size="large">
				<n-card class="profile-identity" :bordered="false">
					<n-space align="center" size="large" :wrap="false">
						<n-avatar round :size="72" color="var(--color-primary)">
							{{ getInitials(user?.nome) }}
						</n-avatar>
						<div class="identity-copy">
							<n-text strong class="testo2">{{ user?.nome || "Utente" }}</n-text>
							<n-text depth="3" class="testo4">{{ user?.email || "Nessuna email" }}</n-text>
							<n-tag type="primary" size="small">
								Codice famiglia {{ user?.codice || "DEMO" }}
							</n-tag>
						</div>
					</n-space>
				</n-card>

				<n-card title="Aspetto" :bordered="false">
					<n-space vertical size="large">
						<n-space justify="space-between" align="center">
							<n-space align="center" size="small">
								<n-icon size="22" color="var(--color-primary)" aria-hidden="true">
									<MoonOutline />
								</n-icon>
								<n-space vertical size="small">
									<n-text strong>Modalità scura</n-text>
									<n-text depth="3">{{ isDark ? "Attiva" : "Disattiva" }}</n-text>
								</n-space>
							</n-space>
							<n-switch
								:value="isDark"
								aria-label="Attiva o disattiva la modalità scura"
								@update:value="toggleMode" />
						</n-space>

						<n-form-item label="Palette colori">
							<n-select
								:value="palettePreference"
								:options="paletteOptions"
								placeholder="Seleziona palette"
								@update:value="setPalettePreference" />
						</n-form-item>
						<n-text depth="3" class="palette-caption">
							{{ palettePreference === "always-random" ? "Una palette diversa a ogni cambio tema" : `Palette attuale: ${palette?.name || palettePreference}` }}
						</n-text>
					</n-space>
				</n-card>

				<n-card title="Famiglia" :bordered="false">
					<n-descriptions :column="1" label-placement="left">
						<n-descriptions-item label="Identificativo">
							{{ user?.idFamiglia || "Non associata" }}
						</n-descriptions-item>
					</n-descriptions>
				</n-card>
			</n-space>
		</PageContent>
	</div>
</template>

<script>
import {
	NAvatar,
	NCard,
	NDescriptions,
	NDescriptionsItem,
	NFormItem,
	NIcon,
	NSelect,
	NSkeleton,
	NSpace,
	NSwitch,
	NTag,
	NText,
} from "naive-ui";
import { MoonOutline } from "@vicons/ionicons5";
import Header from "../components/Header.vue";
import PageContent from "../components/PageContent.vue";
import { palettes } from "../theme/palettes";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";

export default {
	name: "Profile",
	components: {
		Header,
		PageContent,
		NAvatar,
		NCard,
		NDescriptions,
		NDescriptionsItem,
		NFormItem,
		NIcon,
		NSelect,
		NSkeleton,
		NSpace,
		NSwitch,
		NTag,
		NText,
		MoonOutline,
	},
	computed: {
		user() {
			return useAuthStore().user;
		},
		loading() {
			return useAuthStore().loading;
		},
		isDark() {
			return useThemeStore().isDark;
		},
		mode() {
			return useThemeStore().mode;
		},
		palette() {
			return useThemeStore().palette;
		},
		palettePreference() {
			return useThemeStore().palettePreference;
		},
		paletteOptions() {
			return [
				{ label: "CAMBIA SEMPRE", value: "always-random" },
				...palettes[this.mode].map((item) => ({
					label: item.name,
					value: item.name,
				})),
			];
		},
	},
	methods: {
		toggleMode() {
			useThemeStore().toggleMode();
		},
		setPalettePreference(preference) {
			useThemeStore().setPalettePreference(preference);
		},
		getInitials(name) {
			if (!name) return "U";
			return name
				.split(" ")
				.map((part) => part[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		},
	},
};
</script>

<style scoped>
.identity-copy {
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-xs);
}

.palette-caption {
	margin-top: calc(-1 * var(--space-md));
}
</style>
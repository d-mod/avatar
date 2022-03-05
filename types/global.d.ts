declare function gtag(category: string, event: string, data: any): void

declare module "virtual:pwa-register/vue" {
	// @ts-ignore ignore when vue is not installed
	import type { Ref } from "vue"

	export type RegisterSWOptions = {
		immediate?: boolean
		onNeedRefresh?: () => void
		onOfflineReady?: () => void
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
		onRegisterError?: (error: any) => void
	}

	export function useRegisterSW(options?: RegisterSWOptions): {
		needRefresh: Ref<boolean>
		offlineReady: Ref<boolean>
		updateServiceWorker: (reloadPage?: boolean) => Promise<void>
	}
}

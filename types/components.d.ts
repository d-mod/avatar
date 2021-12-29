declare module "vue" {
    export interface GlobalComponents {
        AptButton: typeof import("@/components/button")
        AptSelect: typeof import("@/components/select")
        AptOption: typeof import("@/components/option")
        AptIndices: typeof import("@/components/indices")
        AptInput: typeof import("@/components/input")
        AptDialog: typeof import("@/components/dialog")
    }
}

export {}

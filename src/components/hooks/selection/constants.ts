import { InjectionKey, Ref } from "vue"
import { BaseType, ClassType, ElementLike } from "../types"

export type InitFunction = (option: Option) => () => void

export const ActiveSymbol = Symbol("[i-selection]active")

export const InitSymbol: InjectionKey<InitFunction> = Symbol("[i-selection]init")

export const ModelValueSymbol = Symbol("[i-selection]model-value")

export const ActiveClassSymbol: InjectionKey<Ref<ClassType>> = Symbol("[i-selection]active-class")
export const ItemClassSymbol: InjectionKey<Ref<ClassType>> = Symbol("[i-selection]item-class")
export const UnactiveSymbol: InjectionKey<Ref<ClassType>> = Symbol("[i-selection]unactive-class")

export const ItemLabelSymbol: InjectionKey<string | ((_: BaseType) => ElementLike | null) | null> = Symbol("[i-selection]label")
export const ItemOptionsSymbol = Symbol("[i-selection]options")

export const ChangeActiveSymbol: InjectionKey<(_: BaseType) => boolean> = Symbol("[i-selection]change-active")

export const IsActiveSymbol: InjectionKey<(_: BaseType) => boolean> = Symbol("[i-selection]is-active")

export interface Option {
	id?: string
	label?: string
	value: any | null
	render(): ElementLike
}

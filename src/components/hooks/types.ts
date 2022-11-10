import { PropType } from "vue"

export type ClassType = string | string[]

export type BaseType = string | number | boolean | object | null | undefined

export const valuePropType = [String, Number, Object, Boolean, null] as PropType<BaseType>

export const classPropType = [String, Array] as PropType<string | string[]>

export type ElementLike = JSX.Element | string | ElementLike[]

export const labelPropType = [String, Function] as PropType<string | ((val?: BaseType) => string) | null>

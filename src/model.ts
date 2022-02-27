export interface DressImage {
	name: string
	width: number
	height: number
	x: number
	y: number
	z: number
	url: string
}

export interface Dress {
	name: string
	icon: string
	code: string
	profession?: string
	part: string
	images: DressImage[]
	hash?: string
}

export interface DressIcon {
	name: string
	x: number
	y: number
}

export interface DressingState {
	profession_list: Profession[]
	profession?: Profession
	dresses: any
	icons: Record<string, Record<string, DressIcon[]>>
}

export interface Weapon {
	name: string
	label: string
	aliases: string[]
}

export interface CodeTemplate {
	name?: string
	query?: Record<string, string>
}

export interface Profession extends CodeTemplate {
	name: string
	label: string
	sortNumber: number
	weapons: Weapon[]
}

export interface Collocation {
	id: string
	name: string
	description: string
	author: string
	code: string
	profession: string
	type: string
	year: number
	amount: number
	custom: boolean
}

export interface CollocationType {
	name: string
	label: string
}

export interface CollocationQuery {
	profession: string
	keyword: string
	size: number
	page: number
	year: number
	type: string | false
}
export interface PartValue extends Dress {
	title?: string
}

export type PartList = Record<string, PartValue>

export interface CodeQuery {
	part: string
	code?: string
	weapon?: string
}

export interface CanvasProps {
	width: number
	height: number
	scale: number
}

<template>
    <profession @apply="apply" />
    <div class="flex h-full p-4 flex-wrap justify-center items-center overflow-y-auto">
        <div class="card flex flex-wrap justify-center">
            <div class="left">
                <div class="tools">
                    <apt-button title="重置" @click="clear" size="normal" color="gray">
                        <div class="i-mdi-refresh text-xl"></div>
                    </apt-button>
                    <apt-button title="导入" @click="imports" size="normal" type="primary">
                        <div class="i-mdi-arrow-left-bold-box-outline text-xl"> </div>
                    </apt-button>
                    <apt-button title="导出" @click="exports()" type="info" size="normal">
                        <div class="i-mdi-arrow-right-bold-box-outline text-xl"></div>
                    </apt-button>
                </div>
                <canvas-box :height="canvas_props.height" :width="canvas_props.width" :images="images" :offset="base_offset" :scale="scale"></canvas-box>
                <div class="part">
                    <div
                        :key="p"
                        :style="partStyle(index)"
                        :class="{ active: p === code_query.part, item: true }"
                        @contextmenu.prevent="reset(p as string)"
                        @click.left="selectPart(p as string)"
                        v-for="(value, p, index) in parts"
                    >
                        <div class="icon" :title="value.title" v-if="!validateCode(value.code)" v-text="value.title"></div>
                        <img class="icon" :src="value.icon || DEFAULT_SRC" :title="label(value)" @error="error" draggable="false" v-else />
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="tools">
                    <apt-select placeholder="武器" v-if="code_query.part === 'weapon'" v-model="$weapon">
                        <apt-option :key="weapon.name" :label="weapon.label" :value="weapon.name" v-for="weapon in $weapon_list" />
                    </apt-select>
                    <apt-input placeholder="搜索" v-model="keyword"> </apt-input>
                </div>
                <div class="select">
                    <div @click.prevent="reset(code_query.part)" class="icon default"></div>
                    <div :class="{ active: isActive(dress) }" :key="dress.hash" :style="style(dress)" :title="label(dress)" @click="selectDress(dress)" class="icon" v-for="dress in show_list"></div>
                </div>
            </div>
        </div>

        <collocation class="card" @export="exports" @import="apply" />
        <license />
    </div>
    <apt-dialog dialogClass="import-dialog" v-model:visible="showDialog">
        <div class="title">导入</div>
        <apt-input v-model="code" placeholder="请输入代码" class="input"></apt-input>

        <div class="actions">
            <apt-button @click="showDialog = false" class="cancel" :outline="false">取消</apt-button>
            <apt-button @click="imports_done" :outline="false">确定</apt-button>
        </div>
    </apt-dialog>
</template>

<script setup lang="ts">
    import { computed, ref, onMounted, reactive } from "vue"
    import { useRoute, useRouter } from "vue-router"
    import qs from "qs"

    import DEFAULT_SRC from "@/assets/default.png"
    import EMPTY_SRC from "@/assets/empty.png"

    import CanvasBox from "@/components/canvas-box"
    import Profession from "./profession.vue"

    import Collocation from "./collocation.vue"
    import License from "./license.vue"

    import { CodeTemplate, Dress, DressIcon, DressImage } from "@/model"
    import { useDressingStore } from "@/store"
    import { showToast } from "@/components/toast"

    interface PartValue extends Dress {
        title?: string
    }

    interface PartList {
        [key: string]: PartValue
    }

    interface CodeQuery {
        part: string
        code?: string
        weapon?: string
    }

    interface CanvasProps {
        width: number
        height: number
        scale: number
    }

    const part_titles: Record<string, string> = {
        hair: "头部",
        cap: "帽子",
        face: "脸部",
        neck: "胸部",
        coat: "上衣",
        skin: "皮肤",
        belt: "腰带",
        pants: "下装",
        shoes: "鞋"
    }

    function createDefault(part: string): PartValue {
        return {
            name: "",
            part,
            icon: EMPTY_SRC,
            images: [],
            code: "-1",
            title: part_titles[part]
        }
    }

    const code_query = reactive<CodeQuery>({
        part: "skin"
    })

    const canvas_props = reactive<CanvasProps>({
        width: 300,
        height: 300,
        scale: 100
    })

    const store = useDressingStore()

    const $weapon_list = computed(() => store.profession?.weapons || [])
    const $weapon = computed(() => $weapon_list.value.find(e => e.name == code_query.weapon))

    const current_part = computed(() => {
        let part = code_query.part
        if (part == "weapon" && !!code_query.weapon) {
            part = code_query.weapon
        }
        return part
    })

    const scale = computed(() => canvas_props.scale / 100)
    const keyword = ref("")
    const icons = ref<DressIcon[]>([])
    const weapon = ref("")
    const images = computed(() => {
        const profession_name = store.profession?.name

        let images: DressImage[] = []
        if (profession_name) {
            for (let part in parts) {
                let array = parts[part].images || []
                let p: string | undefined = part
                if (p === "weapon") {
                    p = code_query.weapon
                }
                if (!p) {
                    continue
                }
                array.forEach(e => (e.url = `/image/${profession_name}/${p}/${e.name}`))
                images.push(...array)
            }
        }
        return images
    })

    const dress_list = ref<Dress[]>([])

    const parts = reactive<PartList>({
        hair: createDefault("hair"),
        cap: createDefault("cap"),
        face: createDefault("face"),
        //   weapon: createDefault("weapon","武器"),
        neck: createDefault("neck"),
        coat: createDefault("coat"),
        skin: createDefault("skin"),
        belt: createDefault("belt"),
        pants: createDefault("pants"),
        shoes: createDefault("shoes")
    })

    function validateCode(code: string) {
        return !!code && parseInt(code) > -1
    }

    /**
     *
     * 图标加载出错的处理
     *
     */
    function error(event: Event) {
        //如果图标不存在,则使用默认图标
        if (event && event.target) {
            const image = event.target as HTMLImageElement
            image.src = DEFAULT_SRC
        }
    }

    function handleSelect(value: any, item: Dress) {
        keyword.value = item.name
        selectDress(item)
    }

    function label(item: Dress) {
        return `${item.name || ""}[${item.code}]`
    }

    function style(item: Dress) {
        let name = `${item.part}/${item.code}.png`

        let index = icons.value.findIndex(e => e.name === name)
        if (index > -1) {
            let info = icons.value[index]
            return {
                backgroundImage: `url("/icon/${item.profession}/${item.part}.png")`,
                backgroundPositionX: `${info.x}px`,
                backgroundPositionY: `${info.y}px`
            }
        }

        let backgroundImage = `url("${DEFAULT_SRC}") `

        return {
            backgroundImage
        }
    }

    function partStyle(index: number) {
        let x = 60
        let y = 60
        let step = 28 + 40
        x += Math.floor(index / 3) * step
        y += (index % 3) * step
        return {
            top: `${x}px`,
            left: `${y}px`
        }
    }

    const keyword_list = computed(() => {
        let arr = keyword.value.split(" ")
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === "") {
                arr.splice(i--, 1)
            }
        }
        return arr
    })

    const show_list = computed(() => {
        let list: Dress[] = []
        if (keyword_list.value.length === 0) {
            list = Array.from(dress_list.value)
        } else {
            list = dress_list.value.filter(match)
        }
        list.sort((a, b) => parseInt(a.code) - parseInt(b.code))
        return list
    })

    /**
     *
     * 匹配符合条件的时装
     *
     */
    function match(item: Dress) {
        const keywords = keyword_list.value
        for (let keyword of keywords) {
            if ((item.name && item.name.match(keyword)) || item.code.match(keyword)) {
                continue
            }
            if (item.name && item.name.indexOf(keyword) > -1) {
                continue
            }
            if (item.code.indexOf(keyword) > -1) {
                continue
            }
            return false
        }
        return true
    }

    function isActive(dress: Dress) {
        let { code, part } = dress
        return !!part && code === parts[part].code
    }

    /**
     *
     * 加载时装
     *
     */
    async function apply({ name, query }: CodeTemplate = {}) {
        for (let p in parts) {
            //如果该部位为武器,则替换为具体的武器子类
            if (!query || !query[p]) {
                //如果参数中不存在该部位代码,则重置该部位
                reset(p)
            }
        }
        if (!name) {
            return
        }
        //切换职业
        store.setProfessionName(name)
        await refresh()
        //获取每个部位的时装信息
        let list = await store.getDress(query)
        const tasks = list.map(async item => await selectDress(item))
        await Promise.all(tasks)
    }

    /**
     *
     * 刷新
     *
     */
    async function refresh() {
        let part = current_part.value

        //根据职业和部位,获取时装列表
        const [icon_data, dress_data] = await Promise.all([store.getIcon(part), store.getDressList(part)])
        icons.value = icon_data
        dress_list.value = dress_data
    }

    /**
     *
     * 选择部位
     *
     */
    async function selectPart(part: string) {
        if (code_query.part !== part) {
            code_query.part = part
            await refresh()
        }
    }
    /**
     *
     * 选择时装
     *
     */
    async function selectDress(item: Dress) {
        let { code, part } = item

        const num = parseInt(code)
        if (isNaN(num) || num === -1) {
            reset(part)
            return
        }
        if (!part || !parts[part]) {
            //确认具体的子武器种类
            part = "weapon"
        }
        parts[part] = Object.assign({ title: parts[part].title }, item)
    }
    /**
     * 重置部位
     *
     */
    function reset(part: string) {
        let title = undefined
        if (!!part) {
            title = parts[part].title
        }
        parts[part] = createDefault(part)
    }

    async function clear() {
        await apply(store.profession)
    }

    const showDialog = ref(false)

    const code = ref("")

    const code_regex = /.*\?(.*=&)*/

    /**
     * 导入时装代码
     */
    async function imports() {
        try {
            let text = await navigator.clipboard.readText()
            if (text.match(code_regex)) {
                code.value = text
            }
        } finally {
            showDialog.value = true
        }
    }

    async function imports_done() {
        showDialog.value = false

        const text = code.value
        if (text.match(code_regex)) {
            let index = text.indexOf("?")
            if (index < 0) {
                index = text.length - 1
            }
            let name = text.substring(0, index)
            let suffix = text.substring(index + 1)
            let query = qs.parse(suffix) as Record<string, string>
            await apply({ name, query })
        }
    }

    async function exports(result?: string) {
        if (!result) {
            let name = store.profession_name
            let query: Record<string, string> = {}
            for (let p in parts) {
                let { code } = parts[p]
                if (validateCode(code)) {
                    let part = (p === "weapon" ? weapon.value : p) || p
                    query[part] = code
                }
            }
            result = `${name}?${qs.stringify(query)}`
        }
        await navigator.clipboard.writeText(result)
        showToast("导出成功，已复制到剪贴板")
        //Snackbar({ content: "导出成功，已复制到剪贴板", type: "success" })
    }

    const base_offset = computed(() => {
        let prof = store.profession ?? { x: 0, y: 0 }
        let x = prof.x + 60
        let y = prof.y + 60
        return { x, y }
    })

    onMounted(async () => {
        const route = useRoute()
        const router = useRouter()
        const list = await store.loadProfession()

        if (list && list.length > 0) {
            let { path: name } = route
            let query = route.query as Record<string, string>
            name = name.replace("/", "")

            let item: CodeTemplate = {}
            if (name && name.length > 0) {
                // 如果路由带有参数,则自动载入代码
                item = { name, query }
                await router.replace("/")
            } else if (store.profession) {
                //如果没有则载入默认的职业装扮
                item = store.profession
            }
            await apply(item)
        }
    })
</script>

<style lang="scss" var>
    @import "../style/theme";

    .card {
        margin-bottom: 12px;
        width: 100%;
        background-color: white;

        box-shadow: 0 1px 3px rgb(18 18 18 / 10%);
        .header {
            padding: 0 24px;
        }
    }

    .import-dialog {
        position: relative;
        height: 120px;
        .title {
            width: 100%;
            height: 36px;
            line-height: 36px;
            color: #212121;
        }

        .input {
            width: 100%;
        }

        .actions {
            position: absolute;
            bottom: 0px;
            right: 0px;
            display: flex;
            padding: 0 12px 12px 0;

            .cancel {
                color: gray;
            }
        }
    }

    .tools {
        width: 100%;
        height: 72px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .right {
        justify-self: flex-end;
        height: 400px;
        overflow: hidden;
        padding: 12px;
        .tools {
            justify-content: flex-end;
        }
    }

    .left {
        height: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .part {
        width: 300px;
        height: 300px;
        position: relative;

        .item {
            color: $text-inner-color;
            font-size: 12px;

            position: absolute;
            width: 32px;
            height: 32px;
            border: 2px solid transparent;
            box-sizing: border-box;

            background-image: url("@/assets/empty.png");
            .icon {
                margin: 0;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
            }

            &:hover {
                transition-duration: 100ms;
                transform: scale(1.3);
            }

            &.active {
                border: #ff4081 2px solid;
            }
        }
    }

    .content {
        width: 100%;
        display: flex;
    }

    .select {
        overflow-y: scroll;
        max-width: 400px;
        width: 300px;
        height: 300px;

        .icon {
            width: 32px;
            height: 32px;
            border: 2px solid transparent;
            margin: 10px;
            box-sizing: border-box;
            float: left;
            user-select: none;
            font-size: 12px;
            color: $text-inner-color;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
                transition-duration: 100ms;
                transform: scale(1.3);
            }

            &.default {
                background-image: url("@/assets/default.png");
            }
        }
    }
</style>

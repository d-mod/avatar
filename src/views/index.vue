<template>
    <mu-container class="app">
        <mu-card class="dressing">
            <mu-card-header class="header">
                <profession-select v-model="profession"/>

                <div class="right">
                    <mu-select
                            v-if="part==='weapon'"
                            v-model="$weapon"
                            label="武器"
                            label-float
                    >
                        <mu-option :key="weapon.name"
                                   :label="weapon.label"
                                   :value="weapon.name"
                                   v-for="weapon in $weapons"
                        ></mu-option>
                    </mu-select>
                    <mu-auto-complete
                            :action-click="()=>this.keyword=''"
                            :action-icon="keyword?'clear':'search'"
                            :data="$list"
                            :filter="filter"
                            @select="handleSelect"
                            label="搜索"
                            label-float
                            v-model="keyword"
                    >
                        <template slot-scope="{value,item}">
                            <span v-text="value"></span>
                        </template>
                    </mu-auto-complete>
                    <mu-menu placement="bottom" open-on-hover>
                        <mu-button color="secondary" flat>
                            选项
                        </mu-button>
                        <mu-list slot="content">
                            <mu-list-item @click="post" button>投稿</mu-list-item>
                            <mu-list-item :to="$route.path" button>清空</mu-list-item>
                            <mu-list-item @click="imports" button>导入</mu-list-item>
                            <mu-list-item @click="exports(null)" button>导出</mu-list-item>
                        </mu-list>
                    </mu-menu>
                </div>
            </mu-card-header>
            <mu-row class="content">
                <mu-col span="4">
                    <loading :total="images.length" :value="count">
                        <canvas-box
                                :height="height"
                                :images="array"
                                :offset="$offset"
                                :scale="$scale"
                                :width="width"
                                canvas-style="margin:auto"
                        >
                        </canvas-box>
                        <mu-slider
                                :format="e=>`${e}%`"
                                :max="500"
                                :min="50"
                                :step="5"
                                class="slider"
                                label="比例"
                                v-model="scale"
                        >
                        </mu-slider>
                    </loading>
                </mu-col>
                <mu-col class="part" span="4">
                    <mu-col
                            :key="p"
                            :offset="partOffset(p)"
                            class="item"
                            span="3"
                            v-for="(value,p) in parts"
                    >
                        <img
                                :class="{'active':p ===part,'icon':true}"
                                :src="value.icon || defaultSrc"
                                :title="label(value)"
                                @click="selectPart(p)"
                                @contextmenu.prevent="reset(p)"
                                @error="error"
                                draggable="false"/>
                    </mu-col>
                </mu-col>
                <mu-col class="col select" span="4" v-loading="!$list">
                    <div :style='`backgroundImage:url("${emptySrc}")`'
                         @click.prevent="reset(part)"
                         class="icon"
                    ></div>
                    <div
                            :key="avatar.hash"
                            :style="style(avatar)"
                            :title="label(avatar)"
                            @click="selectDress(avatar)"
                            class="icon"
                            v-for="avatar in $list"
                    ></div>
                </mu-col>
            </mu-row>
        </mu-card>
        <collocation
                @import="apply"
                @export="exports"
        />
        <fab/>
        <license/>
    </mu-container>
</template>

<script>
    import ProfessionSelect from "./profession-select"
    import DEFAULT_SRC from "@/assets/default.png"
    import EMPTY_SRC from "@/assets/empty.png"
    import Loading from "@/components/loading"
    import CanvasBox from "@/components/canvas-box"
    import qs from "qs"
    import clipboard from "clipboard-polyfill"
    import {GET_DRESS, GET_DRESS_LIST, GET_ICON, GET_PROFESSION, SET_PROFESSION} from "../constants/dressing"
    import Collocation from "./collocation"
    import Fab from "./fab"
    import License from "./license"

    function createDefault() {
        return {
            icon: EMPTY_SRC,
            image: [],
            code: "-1"
        }
    }

    function validateCode(code) {
        return !!code && parseInt(code) > -1
    }

    export default {
        name: "dressing",
        components: {License, Fab, Collocation, ProfessionSelect, CanvasBox, Loading},
        async created() {
            const list = await this.$store.dispatch(GET_PROFESSION)
            if (list && list.length > 0) {
                this.profession = list[0].name
                let {path: name, query} = this.$route
                name = name.replace("/", "")
                let item = {}
                if (name && name.length > 0) {
                    // 如果路由带有参数,则自动载入代码
                    item = {name, query}
                    await this.$router.push("/")
                } else {
                    //如果没有则载入默认的职业装扮
                    item = this.$profession
                }
                await this.apply(item)
            }

        },
        methods: {
            partOffset(p) {
                if (p === "hair" || p === "belt") {
                    return 3
                }
                return 0
            },
            /**
             *
             * 图标加载出错的处理
             *
             */
            error(event) {
                //如果图标不存在,则使用默认图标
                event.srcElement.src = this.defaultSrc
            },
            handleSelect(value, item) {
                this.keyword = item.name
                this.selectDress(item)
            },
            label(item) {
                return `${item.name || ""}[${item.code}]`
            },
            style(item) {
                let name = `${item.part}/${item.code}.png`
                let array = this.icons || []
                let index = array.findIndex(e => e.name === name)
                let part = this.part === "weapon" ? this.weapon : this.part
                if (index > -1) {
                    let info = array[index]
                    return {
                        backgroundImage: `url("/icon/${item.profession}/${part}.png")`,
                        backgroundPositionX: `${info.x}px`,
                        backgroundPositionY: `${info.y}px`
                    }
                }
                return {
                    backgroundImage: `url("${this.defaultSrc}")`
                }
            },
            /**
             *
             *  加载
             *
             */
            load() {
                this.count++
            },
            filter(keyword, data) {
                return data.map(item => {
                    return {
                        value: this.label(item),
                        item
                    }
                })
            },
            /**
             *
             * 匹配符合条件的时装
             *
             */
            match(item) {
                for (let i = 0; i < this.$keyword.length; i++) {
                    let key = this.$keyword[i]
                    if ((item.name && item.name.match(key)) || item.code.match(key)) {
                        continue
                    }
                    if (item.name && item.name.indexOf(key) > -1) {
                        continue
                    }
                    if (item.code.indexOf(key) > -1) {
                        continue
                    }
                    return false
                }
                return true
            },
            /**
             *
             * 加载时装
             *
             */
            async apply({name, query}) {
                for (let p in this.parts) {
                    //如果该部位为武器,则替换为具体的武器子类
                    let part = p === "weapon" ? this.weapon : p
                    if (!query[part]) {
                        //如果参数中不存在该部位代码,则重置该部位
                        this.reset(p)
                    }
                }
                //切换职业
                this.profession = name
                //获取每个部位的时装信息
                let array = await this.$store.dispatch(GET_DRESS, {name, query})
                let tasks = array.map(item => this.selectDress(item))
                await Promise.all(tasks)
            },
            /**
             *
             * 刷新
             *
             */
            async refresh() {
                let {profession, part} = this.$condition
                if (part === "weapon") {
                    part = this.weapon
                }
                //根据职业和部位,获取时装列表
                this.list = await this.$store.dispatch(GET_DRESS_LIST, {profession, part})
                this.icons = await this.$store.dispatch(GET_ICON, {profession, part})
            },
            /**
             *
             * 选择部位
             *
             */
            selectPart(part) {
                this.part = part
            },
            /**
             *
             * 选择时装
             *
             */
            async selectDress(item) {
                let {code, part} = item
                if (isNaN(code) || code === -1) {
                    this.reset(item.part)
                    return
                }
                if (!this.parts[part] && part !== "custom") {
                    this.currentWeapon = part
                    part = "weapon"
                }
                this.parts[part] = Object.assign({}, item)
            },
            /**
             * 重置部位
             *
             */
            reset(part) {
                this.parts[part] = createDefault()
            },
            /**
             * 导入时装代码
             */
            async imports() {
                let regex = /.*\?(.*=&)*/
                let text = await clipboard.readText()
                let inputValue = ""
                if (text.match(regex)) {
                    inputValue = text
                }
                let {result, value} = await this.$prompt("请输入时装代码", "导入", {
                    inputValue,
                    validator(val) {
                        let valid = val.match(/.*\?(.*=&)*/)
                        let message = "无法识别的代码格式"
                        return {valid, message}
                    }
                })
                if (result) {
                    let index = value.indexOf("?")
                    if (index < 0) {
                        index = value.length - 1
                    }
                    let name = value.substring(0, index)
                    let suffix = value.substring(index + 1)
                    let query = qs.parse(suffix)
                    await this.apply({name, query})
                }
            },
            async exports(result) {
                if (!result) {
                    let name = this.profession
                    let query = {}
                    for (let p in this.parts) {
                        let {code} = this.parts[p]
                        if (validateCode(code)) {
                            let part = p === "weapon" ? this.weapon : p
                            query[part] = code
                        }
                    }
                    query = qs.stringify(query)
                    result = `${name}?${query}`
                }
                await clipboard.writeText(result)
                await this.$alert("导出成功，已复制到剪贴板", "导出")
            },
            /**
             *
             * 投稿
             *
             */
            post() {
                this.$alert("很抱歉,投稿功能已下线", "提示")
            }
        },
        watch: {
            $profession(val) {
                if (val.weapons && val.weapons.length) {
                    this.weapon = val.weapons[0].name
                }
                this.currentWeapon = this.weapon
                this.apply(val)
            },
            $condition() {
                this.refresh()
            },
            images(val) {
                let array = []
                this.count = 0
                if (val.length === 0) {
                    this.array = array
                    return
                }
                let hash = new Date().getTime()
                this.hash = hash
                for (let image of val) {
                    let img = new Image
                    img.src = image.url
                    img.onload = () => {
                        if (hash !== this.hash) {
                            return
                        }
                        this.count++
                        array.push(Object.assign({img}, image))
                        if (array.length === val.length) {
                            this.array = array.sort((a, b) => a.z - b.z)
                        }
                    }
                }
            }
        },
        computed: {
            $weapons() {
                return this.$profession["weapons"]
            },
            prof_array() {
                return this.$store.getters.prof_array || []
            },
            $offset() {
                let prof = this.$profession || {x: 0, y: 0}
                let x = prof.x + 100
                let y = prof.y + 100
                return {x, y}
            },
            profession: {
                async set(val) {
                    await this.$store.dispatch(SET_PROFESSION, val)
                    this.selectPart(this.part)
                },
                get() {
                    return this.$store.getters.profession
                }
            },
            $profession() {
                return this.$store.getters.$profession
            },
            $condition() {
                return {
                    profession: this.profession,
                    part: this.part
                }
            },
            images() {
                let images = []
                for (let part in this.parts) {
                    let array = this.parts[part].images || []
                    let p = part
                    if (p === "weapon") {
                        p = this.currentWeapon
                    }
                    array.forEach(e => e.url = `/image/${this.profession}/${p}/${e.name}`)
                    images = images.concat(array)
                }
                return images
            },
            $scale() {
                return this.scale / 100
            },
            $values() {
                let values = []
                for (let key in this.parts) {
                    let value = key === "weapon" ? this.currentWeapon : key
                    values.push({
                        value,
                        label: value
                    })
                }
                return values
            },
            $list() {
                let list = []
                if (this.$keyword.length === 0) {
                    Object.assign(list, this.list)
                } else {
                    list = this.list.filter(this.match)
                }
                list.sort((a, b) => parseInt(a.code) - parseInt(b.code))
                return list
            },
            $avatar() {
                return {
                    part: this.part,
                    profession: this.profession
                }
            },
            $keyword() {
                let arr = this.keyword.split(" ")
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === "") {
                        arr.splice(i--, 1)
                    }
                }
                return arr
            },
            $emptyStyle() {
                return {
                    backgroundImage: `url("${this.emptySrc}")`
                }
            },
            $weapon: {
                set(val) {
                    this.weapon = val
                    this.selectPart("weapon")
                },
                get() {
                    return this.weapon
                }
            }
        },
        data() {
            return {
                count: 0,
                width: 300,
                height: 300,
                defaultSrc: DEFAULT_SRC,
                hash: null,
                scale: 100,
                array: [],
                length: 75,
                emptySrc: EMPTY_SRC,
                keyword: "",
                list: [],
                icons: [],
                part: "skin",
                loading: false,
                weapon: null,
                currentWeapon: null,
                parts: {
                    hair: createDefault(),
                    cap: createDefault(),
                    face: createDefault(),
                    weapon: createDefault(),
                    neck: createDefault(),
                    coat: createDefault(),
                    skin: createDefault(),
                    belt: createDefault(),
                    pants: createDefault(),
                    shoes: createDefault()
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "../style/theme";

    .dressing {
        width: 100%;
        height: 436px;

        .header {
            width: 100%;
            height: 96px;
            background: $theme-color;
            display: flex;
            justify-content: space-between;

            .left {
                width: 50%;
                align-items: center;
            }

            .right {
                float: right;
                width: 50%;
                display: flex;
                justify-content: flex-end;
                align-items: center;

                & > * {
                    margin-left: 20px;
                }
            }
        }

        .slider {
            width: 80%;
            margin: auto;
        }

        .part {
            min-height: 320px;
            align-items: center;
            display: flex;
            flex-wrap: wrap;
        }

        .content {
            width: 100%;
        }

        .icon {
            width: 30px;
            height: 30px;
            margin: 10px;
            border: 1px solid transparent;
            box-sizing: border-box;
            float: left;
            user-select: none;
            user-focus: none;

            &:hover {
                transition-duration: 100ms;
                transform: scale(1.3);
            }

            &:hover:not(.active) {
                border: $theme-darken-color 2px solid;
            }

            &.active {
                border: #ff4081 2px solid
            }
        }

        .select {
            overflow: auto;
            max-height: 320px;
        }

    }
</style>


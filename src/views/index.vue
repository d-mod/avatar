<template>
    <mu-container class="app">
        <mu-card class="dressing">
            <mu-card-header class="header">
                <profession-select
                        :value="profession"
                        @change="selectProfession"
                />
                <div class="tools">
                    <mu-button flat  color="gray" @click="clear">
                        <mu-icon value="refresh" left></mu-icon>
                        <span>重置</span>
                    </mu-button>
                    <mu-button flat  color="primary" @click="imports">
                        <mu-icon value="arrow_upward" left></mu-icon>
                        <span>导入</span>
                    </mu-button>
                    <mu-button flat  color="secondary" @click="exports(null)">
                        <mu-icon value="arrow_downward" left></mu-icon>
                        <span>导出</span>
                    </mu-button>
                </div>
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
                    <div class="info" :class="{'show':showInfo}">
                        <div class="item" @click="selectPart(p)" v-for="(value,p) in parts">
                            <span class="title" v-text="value.title"></span>
                            <span class="name" >{{value | name}}</span>
                        </div>
                    </div>
                    <div class="center">
                        <mu-col class="half" span="3">
                            <img class="icon" :src="defaultSrc"/>
                        </mu-col>
                        <mu-col class="half" span="9">
                            <mu-col
                                    :key="p"
                                    class="item"
                                    span="4"
                                    v-for="(value,p) in parts"
                            >
                                <div
                                        v-if="!validateCode(value.code)"
                                        v-text="value.title"
                                        :style="{background:`url(${emptySrc})`}"
                                        :title="value.title"
                                        :class="{'active':p ===part,'icon':true }"
                                        @click="selectPart(p)"
                                        @contextmenu.prevent="reset(p)">
                                </div>
                                <img
                                        v-else
                                        :class="{'active':p ===part,'icon':true}"
                                        :src="value.icon || defaultSrc"
                                        :title="label(value)"
                                        @click="selectPart(p)"
                                        @contextmenu.prevent="reset(p)"
                                        @error="error"
                                        draggable="false"/>
                            </mu-col>
                        </mu-col>
                    </div>
                    <div class="footer">
                        <mu-button class="switch" flat color="primary" small @click="showInfo=!showInfo">切换显示方式</mu-button>
                    </div>
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
    import {GET_DRESS, GET_DRESS_LIST, GET_ICON, GET_PROFESSION} from "../constants/dressing"
    import Collocation from "./collocation"
    import Fab from "./fab"
    import License from "./license"

    function createDefault(title) {
        return {
            icon: EMPTY_SRC,
            image: [],
            code: "-1",
            title
        }
    }

    function validateCode(code) {
        return !!code && parseInt(code) > -1
    }

    export default {
        name: "dressing",
        components: {License, Fab, Collocation, ProfessionSelect, CanvasBox, Loading},
        async mounted() {
            const list = await this.$store.dispatch(GET_PROFESSION)
            if (list && list.length > 0) {
                this.profession =  list[0].name


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
            validateCode,
            partOffset(p) {
                if (p === "hair" || p === "belt"|| p ==="neck") {
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
                if (index > -1) {
                    let info = array[index]
                    return {
                        backgroundImage: `url("/icon/${item.profession}/${item.part}.png")`,
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
                    let part = p === "weapon" ? this.$weapon : p
                    if (!query[part]) {
                        //如果参数中不存在该部位代码,则重置该部位
                        this.reset(p)
                    }
                }
                //切换职业
                this.profession = name
                await this.refresh()
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
                let profession=this.profession
                let part = this.part
                if (part === "weapon") {
                    part = this.$weapon
                }

                let [icons, list] = await Promise.all([
                    this.$store.dispatch(GET_ICON, {profession, part}),
                    this.$store.dispatch(GET_DRESS_LIST, {profession, part})
                ])
                //根据职业和部位,获取时装列表
                this.icons = icons
                this.list = list
            },
            async selectProfession(name) {
                let profession = this.prof_array.find(e=>e.name===name)
                if(!!profession) {
                    console.log(profession)
                    await this.apply(profession)
                }
            },

            /**
             *
             * 选择部位
             *
             */
            async selectPart(part) {
                if (this.part !== part) {
                    this.part = part
                    await this.refresh()
                }
            },
            /**
             *
             * 选择时装
             *
             */
            async selectDress(item) {
                let {code, part} = item
                if (isNaN(code) || code === -1) {
                    this.reset(part)
                    return
                }
                if (!this.parts[part]) {
                    //确认具体的子武器种类
                    part = "weapon"
                }
                this.parts[part] = Object.assign({title:this.parts[part].title}, item)
            },
            /**
             * 重置部位
             *
             */
            reset(part) {
                this.parts[part] = createDefault(this.parts[part].title)
            },

            async clear(){
               await this.apply(this.$profession)
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
            }
        },
        watch: {
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
                    img.src = image.url
                }
            }
        },
        computed: {
            $weapons() {
                return this.$profession?this.$profession["weapons"]:[]
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
            $profession() {
                //@ts-ignore
                return this.prof_array.find(e => e.name === this.profession)
            },
            images() {
                let images = []
                for (let part in this.parts) {
                    let array = this.parts[part].images || []
                    let p = part
                    if (p === "weapon") {
                        p = this.$weapon
                    }
                    if(!p){
                        continue
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
                    let value = key === "weapon" ? this.$weapon : key
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
                    if(!this.weapon&&this.$weapons.length){
                        this.weapon = this.$weapons[0].name
                    }
                    return this.weapon
                }
            }
        },
        filters:{
          name(value){
              if(!validateCode(value.code)){
                return "无"
              }
              return `${value.name||'未知'}[${value.code}]`
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
                profession:"swordman",
                loading: false,
                weapon: null,
                showInfo:false,
                parts: {
                    hair: createDefault("头部"),
                    cap: createDefault("帽子"),
                    face: createDefault("脸部"),
                 //   weapon: createDefault("武器"),
                    neck: createDefault("胸部"),
                    coat: createDefault("上衣"),
                    skin: createDefault("皮肤"),
                    belt: createDefault("腰部"),
                    pants: createDefault("下装"),
                    shoes: createDefault("鞋")
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "../style/theme";

    .app{
        padding: 12px 0;
    }

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

            .tools{
                height: 72px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .right {
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
            position: relative;
            height: 330px;

            .center{
                height: 300px;
                display: flex;
                .half{
                    min-height: 280px;
                    align-items: center;
                    justify-content: center;
                    display: flex;
                    flex-wrap: wrap;
                }
            }

            .info {
                position: absolute;
                width: 100%;
                height: 280px;
                visibility: hidden;
                z-index: 1;
                background-color: white;
                display: flex;
                flex-wrap: wrap;
                padding: 12px 0;
                justify-content: center;

                .item{
                    width: 280px;
                    height: 32px;
                    line-height: 32px;
                    display: flex;
                    user-focus: none;
                    user-select: none;
                    cursor: pointer;
                    padding:0 12px;

                    &:hover{
                        background-color: rgba(0,0,0,0.06);
                    }

                    .title{
                        color: $text-inner-color;
                        width: 40px;
                        margin-right: 12px;
                        display: inline-block;
                    }
                    .name{
                        color: $pink;
                        width: 180px;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                        display: inline-block;
                    }
                }

                &.show {
                    visibility: visible;
                }
            }

            .footer{
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                .switch{
                    width: 100%;
                }
            }

        }

        .content {
            width: 100%;
        }

        .icon {
            width: 32px;
            height: 32px;
            margin: 10px;
            border: 2px solid transparent;
            box-sizing: border-box;
            float: left;
            user-select: none;
            user-focus: none;
            font-size: 9px;
            color: $text-inner-color;
            display: flex;
            align-items: center;
            justify-content: center;

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
            overflow-y: scroll;
            max-height: 320px;

            &::-webkit-scrollbar { //滚动条的宽度
                width: 8px;
            }

            &::-webkit-scrollbar-thumb {
                background-color: $light-blue;
                border-radius: 2em;
            }
        }

    }
</style>


<template>
    <mu-card style="width: 100%" class="collocation">
        <mu-card-header class="header">
            <mu-container>
                <mu-flex>
                    <mu-col span="4">
                        <profession-select :show-all="true"
                                           @change="refresh"
                                           class="input select"
                                           size="small"
                                           v-model="profession">
                        </profession-select>
                    </mu-col>
                    <mu-col span="4">
                        <mu-select @change="refresh"
                                   class="input"
                                   label="类型"
                                   size="small"
                                   v-model="refreshQuery.type">
                            <mu-option
                                    :value="null"
                                    label="全部"
                            />
                            <mu-option :key="type.name"
                                       :label="type.label"
                                       :value="type.name"
                                       v-for="type in $types"/>
                        </mu-select>
                    </mu-col>
                    <mu-col span="4">
                        <mu-select @change="refresh"
                                   class="input"
                                   label="年份"
                                   size="small"
                                   v-model="refreshQuery.year">
                            <mu-option
                                    :value="null"
                                    label="全部"
                            >
                            </mu-option>
                            <mu-option :key="year"
                                       :label="`${year}年`"
                                       :value="year"
                                       v-for="year in $years">
                            </mu-option>
                        </mu-select>
                    </mu-col>
                </mu-flex>
                <mu-flex just-content="center">
                    <mu-text-field
                            :action-click="refresh"
                            @keyup.enter.native="refresh"
                            action-icon="search"
                            class="input"
                            v-model="refreshQuery.keyword">
                    </mu-text-field>
                </mu-flex>
            </mu-container>
        </mu-card-header>
        <mu-row class="list" fill>
            <mu-col :key="index" span="2" v-for="(item,index) in $list">
                <div
                        :style="style(item)"
                        class="mask">
                    <div :title="item.description" class="item">
                        <div class="name" v-text="item.name"></div>
                        <div class="info">
                            <span>作者:</span>
                            <span class="text" v-text="item.author"></span>
                        </div>
                        <div class="info">
                            <span>热度:</span>
                            <span v-text="item.amount"></span>
                        </div>
                        <mu-button @click="imports(item)"
                                   color="cyan200"
                                   v-text="item.custom?'下载':'导入'"></mu-button>
                        <mu-button @click="exports(item)" color="cyan200"
                                   v-if="!item.custom">导出
                        </mu-button>
                    </div>
                </div>
            </mu-col>
        </mu-row>
        <mu-row>
            <mu-button large class="load-more" color="secondary" @click="load" full-width>
                <mu-icon left value="expand_more"></mu-icon>
                <span>加载更多</span>
            </mu-button>
        </mu-row>
    </mu-card>
</template>

<script>
    import {GET_COLLOCATION, INIT_COLLOCATION} from "@/constants/collocation"
    import ProfessionSelect from "./profession-select"
    import qs from "qs"

    export default {
        name: "collocation",
        components: {ProfessionSelect},
        mounted() {
            return this.$store.dispatch(INIT_COLLOCATION)
        },
        computed: {
            $professions() {
                return this.$store.getters.prof_array || []
            },
            $profession() {
                return this.$store.getters.profession
            },
            $types() {
                return this.$store.getters.collocation_types || []
            },
            $years() {
                let current = new Date().getFullYear()
                let years = new Array(current - 2007)
                for (let i = 0; i < years.length; i++) {
                    years[i] = current - i
                }
                return years
            },
            $list() {
                return this.$store.getters.display_list || []
            }
        },
        watch: {
            $profession(val) {
                this.profession = val
                this.refresh()
            }
        },
        data() {
            return {
                profession: "swordman",
                loading: false,
                refreshing: false,
                refreshQuery: {
                    year: null,
                    keyword: "",
                    custom: null,
                    type: null,
                    page: 0,
                    size: 12,
                },
                loadQuery: {
                    page: 0,
                    totalPages: 1
                }
            }
        },
        methods: {
            imports({id, profession, code, custom}) {
                let query = qs.parse(code)
                this.$emit("import", {name: profession, query})
                window.scrollTo(0, 0)
            },

            exports({profession, code}) {
                this.$emit("export", `${profession}?${code}`)
            },
            async refresh() {
                this.refreshing = true
                await this.$store.dispatch(GET_COLLOCATION, {
                    profession: this.profession,
                    query: this.refreshQuery
                })
                this.loadQuery.page = 0
                this.refreshing = false
            },
            async load() {
                this.loadQuery.page++
                let query = Object.assign({}, this.refreshQuery, this.loadQuery)
                this.loading = true
                await this.$store.dispatch(GET_COLLOCATION, {profession: this.profession, query})
                this.loading = false
            },
            offset() {
                let prof = this.$store.getters.$profession || {x: 0, y: 0}
                let x = prof.x + 25
                let y = prof.y / 5
                return {x, y}
            },
            style(item) {
                return {
                    backgroundImage: `url("/image/cover/${item.id}.png")`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }
            }
        }
    }
</script>
<style scoped lang="scss">
    @import "../style/theme";

    .collocation {
        .header {
            background: $theme-color;
        }

        .input {
            width: 80%;
            line-height: 1rem;
            text-align: center;
            margin-bottom: 1rem;
        }

        .select .el-icon-arrow-up {
            display: none
        }

        .list {
            transition: all 0.3s;

            .item {
                position: relative;
                width: 100%;
                height: 240px;
                padding-top: 30px;
                transition: all 0.4s ease;

                .info {
                    font-size: 14px;
                    width: 100%;
                    display: block;
                    color: white;
                    text-align: center;
                    visibility: hidden;

                    .text {
                        color: $light-blue;
                    }
                }

                .name {
                    width: 100%;
                    font-size: 12px;
                    text-align: center;
                    overflow: hidden;
                    white-space: nowrap
                }

                button {
                    display: block;
                    margin: 1rem auto;
                    border-radius: 3px;
                    visibility: hidden;
                    transition-duration: 0s
                }

                &:hover {
                    background: rgba(0, 0, 0, 0.48);

                    .info, button {
                        visibility: visible
                    }

                    .name {
                        color: white;
                    }
                }
            }
        }

        .load-more {
            margin-top: 20px;
        }

    }

</style>

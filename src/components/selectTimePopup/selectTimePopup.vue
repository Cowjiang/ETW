<template>
    <view>
        <u-select
            class="u-select"
            v-model="value"
            :list="timePeriod"
            :mask-close-able="false"
            confirm-color="#f4756b"
            @cancel="handleCancel"
            @confirm="handleConfirm">
        </u-select>
    </view>
</template>

<script>
    /**
     * @description 选择时间段Popup组件
     * @property {Boolean} value 是否显示Popup弹窗，默认为false
     * @property {Boolean} showCloseBtn 是否显示关闭按钮，默认为true
     * @property {String} timeLimit 可选的时间段，格式如："9:00-21:00"
     * @property {Number} timeInterval 时间段间隔，默认为30
     * @example <selectTimePopup v-model="show" timeLimit="9:00-21:00" @confirm="handleConfirm"></selectTimePopup>
     * @event cancel 用户点击取消按钮
     * @event confirm 用户点击确定按钮
     */
    export default {
        name: "selectTimePopup",
        props: {
            value: {
                type: Boolean,
                default: false
            },
            showCloseBtn: {
                type: Boolean,
                default: true
            },
            timeLimit: {
                type: String,
                default: ''
            },
            timeInterval: {
                type: Number,
                default: 30
            }
        },
        data() {
            return {
                startHour: NaN, // {Number|NaN} 开始小时
                startMinute: NaN,// {Number|NaN} 开始分钟
                endHour: NaN,// {Number|NaN} 结束小时
                endMinute: NaN,// {Number|NaN} 结束分钟
                timePeriod: [], // {Array} 格式化后的时间段数组
            }
        },
        methods: {
            // 初始化
            init() {
                let timeSplit = this.timeLimit.split('-');
                if (timeSplit.length === 2 && timeSplit[0] !== '' && timeSplit[1] !== '') {
                    let startTime = timeSplit[0].replaceAll(' ', '');
                    let endTime = timeSplit[1].replaceAll(' ', '');
                    let startTimeSplit = startTime.split(':');
                    let endTimeSplit = endTime.split(':');
                    if (startTimeSplit.length === 2
                        && endTimeSplit.length === 2
                        && startTimeSplit[0] !== ''
                        && endTimeSplit[0] !== ''
                        && startTimeSplit[1] !== ''
                        && endTimeSplit[1] !== '') {
                        if (!isNaN(this.startHour = parseInt(startTimeSplit[0]))
                            && !isNaN(this.startMinute = parseInt(startTimeSplit[1]))
                            && !isNaN(this.endHour = parseInt(endTimeSplit[0]))
                            && !isNaN(this.endMinute = parseInt(endTimeSplit[1]))
                            && this.startHour <= 23
                            && this.startHour >= 0
                            && this.endHour <= 24
                            && this.endHour >= 0
                            && this.startMinute >= 0
                            && this.startMinute <= 59
                            && this.endMinute >= 0
                            && this.endMinute <= 59
                        ) {
                            //timeLimit属性值通过验证
                            this.computeTimePeriod();
                        }
                        else {
                            //timeLimit属性值不合法
                            console.error(`Illegal variable "timeLimit: ${this.timeLimit}"`);
                        }
                    }
                }
                else {
                    //timeLimit属性值不合法
                    console.error(`Illegal variable "timeLimit: ${this.timeLimit}"`);
                }
            },
            // popup打开事件
            handleCancel() {
                this.$emit("cancel");
            },
            // popup关闭事件
            handleConfirm(e) {
                console.log(e)
                this.$emit("confirm", e);
            },
            // 计算时间段，并添加到picker中
            computeTimePeriod() {
                const hourPeriod = this.endHour - this.startHour; //开始时间与结束时间的小时时间差
                let periodAmount = hourPeriod * 60 / this.timeInterval; //切分时间段的数量
                if (this.startMinute !== 0) {
                    periodAmount -= Math.floor(this.startMinute / this.timeInterval);
                }
                if (this.endMinute !== 0) {
                    if (this.endMinute % this.timeInterval === 0) {
                        periodAmount -= 1;
                    }
                    periodAmount += Math.floor(this.endMinute / this.timeInterval) + 1;
                }
                let index = 0;
                let startHourTemp = this.startHour;
                let startMinuteTemp = this.startMinute;
                let endHourTemp = startHourTemp;
                let endMinuteTemp = startMinuteTemp;
                while (index < periodAmount) {
                    if (endMinuteTemp + this.timeInterval >= 60) {
                        endHourTemp += 1;
                        endMinuteTemp = 0;
                    }
                    else {
                        endMinuteTemp += this.timeInterval;
                    }
                    this.timePeriod.push({
                        value: index,
                        label: `${startHourTemp.toString().padStart(2, '0')}:${startMinuteTemp === 0 ? '00' : startMinuteTemp.toString().padStart(2, '0')} - ${endHourTemp.toString().padStart(2, '0')}:${endMinuteTemp === 0 ? '00' : endMinuteTemp.toString().padStart(2, '0')}`
                    });
                    startHourTemp = endHourTemp;
                    startMinuteTemp = endMinuteTemp;
                    index += 1;
                }
                this.$forceUpdate();
            }
        },
        computed: {
            // 强制触发props变化监听器
            propsChange() {
                return `${this.timeInterval}${this.timeLimit}`;
            }
        },
        watch: {
            // 监听props变化
            propsChange() {
                this.init(); //重新初始化
            }
        },
        mounted() {
        },
        onload() {
        },
        created() {
        },
        onshow() {
        }
    }
</script>

<style lang="scss" scoped>

</style>
import Vue from "vue";
import vuex from 'vuex';

Vue.use(vuex);

const state = {
    windowWidth: 0, //窗口宽度
    windowHeight: 0, //窗口高度
    navigationHeight: 0, //导航栏高度
    currentPageUrl: '', //当前页面Url
    userInfo: null, //当前登录的用户信息
    socketStatus: false, //当前Socket是否已经连接成功
    unreadMessageCount: 0, //用户的未读消息数量
    chatMessages: [], //聊天信息列表
    shopkeeper: false, //当前登录账户为商家
};

export default new vuex.Store({
    state,
    mutations: {
        ...Object.keys(state).reduce((obj, key) => {
            return {
                ...obj,
                [key]: (state, payload) => state[key] = payload
            }
        }, {})
    },
    getters: {
        ...Object.keys(state).reduce((obj, key) => {
            return {
                ...obj,
                [key]: (state) => state[key]
            }
        }, {})
    }
})
import Vue from "vue";
import vuex from 'vuex';

Vue.use(vuex);

const state = {
    windowWidth: 0, //窗口宽度
    windowHeight: 0, //窗口高度
    navigationHeight: 0, //导航栏高度
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
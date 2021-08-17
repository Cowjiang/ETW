<template>
  <view class="load-refresh">
    <!-- 数据列表块 -->
    <view
      class="cover-container"
      :style="[
        {
          background: backgroundCover,
          transform: coverTransform,
          transition: coverTransition,
        },
      ]"
      @touchstart="coverTouchstart"
      @touchmove="coverTouchmove"
      @touchend="coverTouchend"
    >
      <scroll-view
        :scroll-y="isScrollY"
        class="list"
        :scroll-top="scrollTop"
        @scrolltolower="loadMore"
        :style="getHeight"
      >
        <!-- 刷新动画，可自定义，占高120rpx -->
        <view
          v-if="ableToRefresh"
          class="animation"
          :style="[{ '--color': color, background: backgroundCover }]"
        >
          <view v-show="!playState" class="remind">
            {{ moving ? "释放刷新" : "下拉刷新" }}
          </view>
          <view
            v-if="playState && refreshType === 'halfCircle'"
            class="refresh half-circle-spinner"
          >
            <view class="circle circle-1"></view>
            <view class="circle circle-2"></view>
          </view>
        </view>
        <!-- 数据集插槽 -->
        <slot></slot>
        <!-- 上拉加载 -->
        <view v-show="isShowLoadText" class="load-more">
          <i v-show="updating" class="fa fa-spinner fa-pulse fa-fw"></i>
          {{ loadText }}
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: "loadRefresh",
  props: {
    ableToRefresh: {
      type: Boolean,
      default: true,
    },
    isRefresh: {
      type: Boolean,
      default: true,
    },
    refreshType: {
      type: String,
      default: "hollowDots",
    },
    fixedHeight: {
      type: String,
      default: null,
    },
    heightReduce: {
      type: String,
      default: "0",
    },
    color: {
      type: String,
      default: "#f4756b",
    },
    backgroundCover: {
      type: String,
      default: "white",
    },
    currentPage: {
      type: Number,
      default: 0,
    },
    totalNumber: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isScrollY: true,
      startY: 0,
      moveY: 0,
      updating: false, // 数据更新状态（true: 更新中）
      updateType: true, // 数据更新类型（true: 下拉刷新: false: 加载更多）
      moving: false,
      scrollTop: -1,
      coverTransform: "translateY(0px)",
      coverTransition: "0s",
      playState: false, // 动画的状态 暂停 paused/开始 running
      isShowLoadText: false,
    };
  },
  computed: {
    // 计算组件所占屏幕高度
    getHeight() {
      // rpx = px / uni.getSystemInfoSync().windowWidth * 750
      if (this.fixedHeight) {
        return `height: ${this.fixedHeight};`;
      } else {
        let height = uni.getSystemInfoSync().windowHeight - this.heightReduce;
        return `height: ${height}px;`;
      }
    },
    // 判断loadText，可以根据需求自定义
    loadText() {
      const { currentPage, totalNumber, pageSize, updating, updateType } = this;
      let totalPages = this.utils.getTotalPages(totalNumber, pageSize);
      if (!updateType && updating) {
        return "加载中...";
      } else if (currentPage < totalPages) {
        return "上拉加载更多";
      } else {
        return "已经到底啦~";
      }
    },
  },
  methods: {
    // 根据currentPage和totalNumber的值来判断 是否触发@loadMore
    loadMore() {
      this.isShowLoadText = true;
      const { currentPage, totalNumber, pageSize } = this;
      let totalPages = this.utils.getTotalPages(totalNumber, pageSize);
      if (!this.updating && currentPage < totalPages) {
        // console.log(this.updating);
        this.updating = true;
        this.updateType = false;
        this.$emit("loadMore");
      }
    },
    // 回弹效果
    coverTouchstart(e) {
      if (!this.isScrollY || !this.ableToRefresh) {
        console.log("不允许scroll-view滑动 禁止 coverTouchstart");
        return;
      }
      if (this.isRefresh) {
        console.log("正在刷新，禁止coverTouchstart");
        return;
      }
      // this.coverTransition = "transform .1s linear";
      this.startY = e.touches[0].clientY;
    },
    coverTouchmove(e) {
      if (!this.isScrollY || !this.ableToRefresh) {
        console.log("不允许scroll-view滑动 禁止 coverTouchmove");
        return;
      }
      if (this.isRefresh || this.updating) {
        console.log("正在刷新，禁止 coverTouchmove");
        return;
      }
      this.moveY = e.touches[0].clientY;
      // console.log("startY", this.startY);
      // console.log("moveY", this.moveY);
      let moveDistance = this.moveY - this.startY;
      // if (moveDistance <= 75 && moveDistance >= 0) {
      //   this.coverTransform = `translateY(${moveDistance}px)`;
      // }
      this.moving = moveDistance >= 90;
    },
    coverTouchend() {
      if (!this.isScrollY || !this.ableToRefresh) {
        console.log("不允许scroll-view滑动 禁止 coverTouchend");
        return;
      }
      if (this.isRefresh || this.updating) {
        return;
      }
      if (this.moving) {
        this.runRefresh();
      } else {
        // this.coverTransition = "transform 0.3s cubic-bezier(.21,1.93,.53,.64)";
        this.coverTransform = "translateY(0px)";
      }
    },
    //刷新效果+允许刷新方法
    runRefresh() {
      this.$emit("refresh");
      this.scrollTop = 0;
      this.coverTransition = "transform .1s linear";
      this.coverTransform = "translateY(120rpx)";
      this.playState = true;
      this.updating = true;
      this.updateType = true;
    },
    //清除动画以及状态
    completed() {
      if (this.updateType) {
        // 下拉刷新
        this.moving = false;
        this.scrollTop = -1;
        // this.coverTransition = "transform 0.3s cubic-bezier(.21,1.93,.53,.64)";
        this.coverTransform = "translateY(0px)";
        setTimeout(() => {
          this.playState = false;
        }, 300);
      }
      this.updating = false;
    },
  },
};
</script>

<style lang="scss" scoped>
$color: var(--color);

.load-refresh {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  .cover-container {
    width: 100%;
    margin-top: -120rpx;
    .list {
      width: 100%;
      position: fixed;
      .load-more {
        font-size: 32rpx;
        height: 80rpx;
        text-align: center;
        width: 100%;
        color: $uni-text-color-placeholder;
        padding: 16rpx 0;
      }
    }
  }
}

/* 动画 */
.animation {
  width: 100%;
  height: 120rpx;
  .remind {
    color: $uni-text-color-placeholder;
    width: 100%;
    height: 120rpx;
    text-align: center;
    line-height: 120rpx;
  }
  .refresh {
    width: 100%;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    view {
      // animation-play-state: $playState!important;
    }
  }

  /* HollowDots  */
  .hollow-dots-spinner .dot {
    width: 30rpx;
    height: 30rpx;
    margin: 0 calc(30rpx / 2);
    border: calc(30rpx / 5) solid $color;
    border-radius: 50%;
    float: left;
    transform: scale(0);
    animation: hollowDots 1000ms ease infinite 0ms;
  }
  .hollow-dots-spinner .dot:nth-child(1) {
    animation-delay: calc(300ms * 1);
  }
  .hollow-dots-spinner .dot:nth-child(2) {
    animation-delay: calc(300ms * 2);
  }
  .hollow-dots-spinner .dot:nth-child(3) {
    animation-delay: calc(300ms * 3);
  }
  @keyframes hollowDots {
    50% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* halfCircle  */
  .half-circle-spinner .circle {
    content: "";
    position: absolute;
    width: 50rpx;
    height: 50rpx;
    border-radius: 100%;
    border: calc(50rpx / 10) solid transparent;
  }

  .half-circle-spinner .circle.circle-1 {
    border-top-color: $color;
    animation: halfCircle 1s infinite;
  }
  .half-circle-spinner .circle.circle-2 {
    border-bottom-color: $color;
    animation: halfCircle 1s infinite alternate;
  }
  @keyframes halfCircle {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* swappingSquares */
  .swapping-squares-spinner {
    position: relative;
  }
  .swapping-squares-spinner .square {
    height: calc(65rpx * 0.25 / 1.3);
    width: calc(65rpx * 0.25 / 1.3);
    animation-duration: 1000ms;
    border: calc(65rpx * 0.04 / 1.3) solid $color;
    margin-right: auto;
    margin-left: auto;
    position: absolute;
    animation-iteration-count: infinite;
  }
  .swapping-squares-spinner .square:nth-child(1) {
    animation-name: swappingSquares-child-1;
    animation-delay: 500ms;
  }
  .swapping-squares-spinner .square:nth-child(2) {
    animation-name: swappingSquares-child-2;
    animation-delay: 0ms;
  }
  .swapping-squares-spinner .square:nth-child(3) {
    animation-name: swappingSquares-child-3;
    animation-delay: 500ms;
  }
  .swapping-squares-spinner .square:nth-child(4) {
    animation-name: swappingSquares-child-4;
    animation-delay: 0ms;
  }
  @keyframes swappingSquares-child-1 {
    50% {
      transform: translate(150%, 150%) scale(2, 2);
    }
  }
  @keyframes swappingSquares-child-2 {
    50% {
      transform: translate(-150%, 150%) scale(2, 2);
    }
  }
  @keyframes swappingSquares-child-3 {
    50% {
      transform: translate(-150%, -150%) scale(2, 2);
    }
  }
  @keyframes swappingSquares-child-4 {
    50% {
      transform: translate(150%, -150%) scale(2, 2);
    }
  }
}
</style>

<template>
  <view>
    <navigationBar ref="navigationBar"/>

    <view class="privacy-container">
      <u-read-more
        :text-indent="0"
        :show-height="9000">
        <rich-text :nodes="content"></rich-text>
      </u-read-more>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";

    export default {
        name: "privacy",
        components: {
            navigationBar
        },
        data() {
            return {
                content: `尊敬的用户，欢迎使用由食途科技有限公司（下列简称为“食途”）提供的服务。在使用前请您阅读如下服务协议，使用本应用即表示您同意接受本协议，本协议产生法律效力，特别涉及免除或者限制食途责任的条款，请仔细阅读。如有任何问题，可向食途咨询。

        1. 服务条款的确认和接受
        通过访问或使用本应用，表示用户同意接受本协议的所有条件和条款。
        2. 服务条款的变更和修改
        食途有权在必要时修改服务条款，服务条款一旦发生变更，将会在重要页面上提示修改内容。如果不同意所改动的内容，用户可以放弃获得的本应用信息服务。如果用户继续享用本应用的信息服务，则视为接受服务条款的变更。本应用保留随时修改或中断服务而不需要通知用户的权利。本应用行使修改或中断服务的权利，不需对用户或第三方负责。
        3. 用户行为
        3.1 用户账号、密码和安全
        用户一旦注册成功，便成为食途的合法用户。因此用户应采取合理措施维护其密码和帐号的安全。用户对利用该密码和帐号所进行的一切活动负全部责任；由该等活动所导致的任何损失或损害由用户承担，食途不承担任何责任。 用户的密码和帐号遭到未授权的使用或发生其他任何安全问题，用户可以立即通知食途，并且用户在每次连线结束，应结束帐号使用，否则用户可能得不到食途的安全保护。对于用户长时间未使用的帐号，食途有权予以关闭并注销其内容。
        3.2 账号注册时的禁止行为
        （1）请勿以党和国家领导人或其他社会名人的真实姓名、字号、艺名、笔名注册；
        （2）冒充任何人或机构，或以虚伪不实的方式谎称或使人误认为与任何人或任何机构有关的名称；
        （3）请勿注册和其他网友之名相近、相仿的名字；
        （4）请勿注册不文明、不健康名字，或包含歧视、侮辱、猥亵类词语的名字；
        （5）请勿注册易产生歧义、引起他人误解的名字；
        3.3 用户在本应用上不得发布下列违法信息和照片：
        （1）反对宪法所确定的基本原则的；
        （2）危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；
        （3）损害国家荣誉和利益的；
        （4）煽动民族仇恨、民族歧视，破坏民族团结的；
        （5）破坏国家宗教政策，宣扬邪教和封建迷信的；
        （6）散布谣言，扰乱社会秩序，破坏社会稳定的；
        （7）散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；
        （8）侮辱或者诽谤他人，侵害他人合法权益的；
        （9）含有法律、行政法规禁止的其他内容的；
        （10）禁止骚扰、毁谤、威胁、仿冒网站其他用户；
        （11）严禁煽动非法集会、结社、游行、示威、聚众扰乱社会秩序；
        （12）严禁发布可能会妨害第三方权益的文件或者信息，例如（包括但不限于）：病毒代码、黑客程序、软件破解注册信息。
        （13）禁止上传他人作品。其中包括你从互联网上下载、截图或收集的他人的作品；
        （14）禁止上传广告、横幅、标志等网络图片；
        4. 上传或发布的内容
        用户上传的内容是指用户在食途上传或发布的视频或其它任何形式的内容包括文字、图片、音频等。除非食途收到相关通知，否则食途将用户视为其在本应用上传或发布的内容的版权拥有人。作为内容的发表者，需自行对所发表内容负责，因所发表内容引发的一切纠纷，由该内容的发表者承担全部法律及连带责任。食途不承担任何法律及连带责任。
        对于经由本应用而传送的内容，食途不保证前述其合法性、正当性、准确性、完整性或品质。用户在使用本应用时，有可能会接触到令人不快、不适当或令人厌恶的内容。在任何情况下，食途均不对任何内容承担任何责任，包括但不限于任何内容发生任何错误或纰漏以及衍生的任何损失或损害。食途有权（但无义务）自行拒绝或删除经由本应用提供的任何内容。
        个人或单位如认为食途存在侵犯自身合法权益的内容，应准备好具有法律效应的证明材料，及时与食途取得联系，以便食途迅速作出处理。

        隐私条款
        1.用户信息公开情况说明
        在注册了账号后我们会收集您的部分信息，该信息只为了帮助您完成账号注册并且更好的为您提供信息服务，不对任何第三方公开：
        （1）微信头像
        （2）微信昵称
        （3）微信绑定手机号
        （4）学校名称
        （5）所在地区
        （6）生日
        尊重用户个人隐私是食途的一项基本政策。所以，食途不会在未经合法用户授权时公开、编辑或透露其注册资料及保存在本应用中的非公开内容，除非有下列情况：
        （1）有关法律规定或食途合法服务程序规定；
        （2）在紧急情况下，为维护用户及公众的权益；
        （3）为维护食途的商标权、专利权及其他任何合法权益；
        （4）其他需要公开、编辑或透露个人信息的情况；
        在以下（包括但不限于）几种情况下，食途有权使用用户的个人信息：
        （1）食途可以将用户信息与第三方数据匹配；
        2.隐私权政策适用范围
        （1）用户在登录本应用服务器时留下的个人身份信息；
        （2）用户通过本应用服务器与其他用户或非用户之间传送的各种资讯；
        （3）本应用与商业伙伴共享的其他用户或非用户的各种信息；
        3.资讯公开与共享
        食途不会将用户的个人信息和资讯故意透露、出租或出售给任何第三方。但以下情况除外：
        （1）用户本人同意与第三方共享信息和资讯;
        （2）只有透露用户的个人信息和资讯，才能提供用户所要求的某种产品和服务;
        （3）应代表本应用提供产品或服务的主体的要求提供（除非我们另行通知，否则该等主体无权将相关用户个人信息和资讯用于提供产品和服务之外的其他用途）：根据法律法规或行政命令的要求提供;因外部审计需要而提供;用户违反了本应用服务条款或任何其他产品及服务的使用规定;经本站评估，用户的帐户存在风险，需要加以保护。

        5.账户删除申请
        用户有权在任何时候编辑用户在食途的帐户信息和资讯，用户也可以填写相关申请表格，要求删除个人帐户，但是用户无条件同意在你的帐户删除后，该帐户内及与该帐户相关的信息和资讯仍然保留在本网站档案记录中，除上述第三条规定的情况外，食途将为用户保密。
      `
            }
        },
        methods: {},
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '用户隐私协议',
                backgroundColor: '#fff'
            });
        }
    }
</script>

<style lang="scss" scoped>
  .privacy-container {
    padding: 20rpx 40rpx 150rpx 40rpx;
    white-space: pre-line;
  }
</style>
configureWebpack: () => {
    if (isDev && isMp) {
        return {
            optimization: {
                minimize: true,
            },
        }
    }
}
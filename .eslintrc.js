module.exports = {
	env: {
		browser: true,
		es6: true
	},
	extends: [
		'plugin:vue/essential',
		'standard'
	],
	globals: {
		uni:'readonly',
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parserOptions: {
		ecmaVersion: 2018
	},
	plugins: [
		'vue'
	],
	rules: {
		'camelcase': 0,
        'vue/script-indent': ['error', 2, {'baseIndent': 1}]
	},
    overrides: [
        {
            'files': ['*.vue'],
            'rules': {
                'indent': 'off'
            }
        }
    ],
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['~', path.resolve(__dirname, './src')],
                    ['@', path.resolve(__dirname, './src')],
                ],
            },
        },
    },
}
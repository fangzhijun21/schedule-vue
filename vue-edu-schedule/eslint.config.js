import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import prettierPlugin from 'eslint-plugin-prettier'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,

  {
    name: 'app/custom-rules',
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // ========== 核心修改：关闭 Vue 模板拆坏代码的规则 ==========
      // 关闭「强制属性换行」，避免 el-button 标签被拆坏
      'vue/max-attributes-per-line': 'off',
      // 关闭「标签闭合换行」，避免 </el-button> 错位
      'vue/html-closing-bracket-newline': 'off',
      // 关闭「标签属性空格校验」，避免格式冲突
      'vue/html-indent': 'off',
      // 关闭「模板标签换行校验」
      'vue/singleline-html-element-content-newline': 'off',

      // ========== 保留你的原有规则 ==========
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: false,
          printWidth: 80,
          trailingComma: 'none',
          endOfLine: 'auto',
          // 新增：禁止 Prettier 强制换行拆坏标签
          htmlWhitespaceSensitivity: 'ignore',
        },
      ],
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index'],
        },
      ],
      'vue/no-setup-props-destructure': 'off',
      'no-undef': 'error',

      // ========== 额外优化：降低无关警告 ==========
      // 关闭 oxlint 过于严格的格式校验
      'oxlint/performance/no-arguments-callee': 'off',
      'oxlint/style/no-console': 'warn',
    },
  },
])

# 国际化 (i18n) 集成文档

## 概述

本项目使用 `i18next` 和 `react-i18next` 实现国际化功能，支持中英文语言切换，并通过 `localStorage` 持久化用户的语言偏好设置。

## 目录结构

```
src/i18n/
├── config.ts          # i18n 配置文件
├── components/
│   └── LanguageSwitcher.tsx  # 语言切换组件
├── resources/
│   ├── en.ts           # 英文翻译资源
│   └── zh.ts           # 中文翻译资源
└── README.md           # 本文档
```

## 核心功能

1. **语言切换**: 通过下拉菜单切换中英文
2. **自动检测**: 自动检测浏览器语言偏好
3. **持久化**: 使用 localStorage 保存用户语言选择
4. **无缝切换**: 切换语言后界面即时更新

## 使用方法

### 在组件中使用翻译

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 带参数的翻译

```typescript
// 翻译资源中定义
{
  "greeting": "Hello {{name}}!"
}

// 使用时
t('greeting', { name: 'World' })  // => "Hello World!"
```

## 添加新的翻译文本

### 步骤 1: 在资源文件中添加翻译键

在 `src/i18n/resources/en.ts` 和 `src/i18n/resources/zh.ts` 中同时添加对应的翻译：

```typescript
// en.ts
export default {
  // ... 现有翻译
  newModule: {
    title: 'New Feature',
    description: 'This is a new feature'
  }
};

// zh.ts
export default {
  // ... 现有翻译
  newModule: {
    title: '新功能',
    description: '这是一个新功能'
  }
};
```

### 步骤 2: 在组件中使用

```typescript
import { useTranslation } from 'react-i18next';

function NewFeature() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('newModule.title')}</h2>
      <p>{t('newModule.description')}</p>
    </div>
  );
}
```

## 扩展支持的语言

### 步骤 1: 创建新的翻译资源文件

```typescript
// src/i18n/resources/ja.ts
export default {
  app: {
    title: '統計分析ツール',
    language: '言語'
  },
  // ... 其他翻译
};
```

### 步骤 2: 更新配置文件

在 `src/i18n/config.ts` 中导入并注册新语言：

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './resources/en';
import zh from './resources/zh';
import ja from './resources/ja';  // 导入新语言

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  ja: { translation: ja }  // 注册新语言
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'querystring', 'cookie'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

### 步骤 3: 更新语言切换组件

在 `src/i18n/components/LanguageSwitcher.tsx` 中添加新语言选项：

```typescript
<Select
  value={i18n.language}
  onChange={(e) => changeLanguage(e.target.value)}
  size="sm"
  width="120px"
>
  <option value="en">{t('app.english')}</option>
  <option value="zh">{t('app.chinese')}</option>
  <option value="ja">日本語</option>
</Select>
```

## 翻译键命名规范

为了保持代码的可维护性，请遵循以下命名规范：

```
<module>.<component>.<element>
```

示例：
- `app.title` - 应用标题
- `dataInput.upload` - 数据输入模块的上传按钮
- `statistics.mean` - 统计模块的均值标签
- `hypothesisTesting.errors.invalidAlpha` - 假设检验模块的错误信息

## 配置说明

`src/i18n/config.ts` 中的关键配置：

| 配置项 | 说明 |
|--------|------|
| `resources` | 翻译资源对象，包含各语言的翻译内容 |
| `fallbackLng` | 默认回退语言，当检测不到语言时使用 |
| `debug` | 是否开启调试模式 |
| `interpolation.escapeValue` | 是否转义插值内容（React中建议设为false） |
| `detection.order` | 语言检测顺序 |
| `detection.caches` | 缓存语言设置的位置 |

## 检测顺序说明

语言检测按照以下顺序进行：

1. `localStorage` - 优先从本地存储读取
2. `navigator` - 检测浏览器语言
3. `querystring` - 从URL参数读取 (?lng=zh)
4. `cookie` - 从Cookie读取

## 注意事项

1. **同步更新**: 添加新翻译时，务必同时更新所有语言资源文件
2. **避免硬编码**: 所有用户可见的文本都应使用 `t()` 函数
3. **参数验证**: 使用带参数的翻译时，确保参数存在
4. **性能优化**: 对于大型应用，可以考虑按需加载翻译资源

## 测试语言切换

运行开发服务器后：

1. 点击页面右上角的语言选择下拉菜单
2. 选择不同语言，观察界面是否即时更新
3. 刷新页面，确认语言偏好已保存
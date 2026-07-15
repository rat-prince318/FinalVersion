# 国际化(i18n)集成计划

## 一、项目分析

### 1.1 项目架构
- **框架**: React 18 + TypeScript
- **UI库**: Chakra UI 2.7.1
- **构建工具**: Vite 4.4.0
- **主要组件**:
  - `StatisticsApp.tsx` - 主应用组件
  - `BasicStatisticsTab.tsx` - 基础统计分析
  - `DistributionGenerator.tsx` - 数据分布生成器
  - `ConfidenceIntervalsContainer.tsx` - 置信区间分析容器

### 1.2 需要翻译的文本类型
根据对代码的分析，需要翻译的文本包括：
- 页面标题和标签
- 按钮文字
- 表单标签和占位符
- 错误消息和提示信息
- 统计术语（如均值、标准差等）

### 1.3 技术选型
采用 **i18next** + **react-i18next** 实现国际化，原因：
- 轻量级、非侵入式
- 支持React Hooks
- 支持本地存储持久化
- 社区成熟，文档完善

---

## 二、实施计划

### 2.1 安装依赖

```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
npm install -D @types/i18next @types/react-i18next
```

### 2.2 创建国际化配置

**文件结构**:
```
src/
  i18n/
    config.ts          # i18next配置
    resources/
      en.ts            # 英文翻译资源
      zh.ts            # 中文翻译资源
    hooks/
      useTranslation.ts # 自定义翻译Hook
    components/
      LanguageSwitcher.tsx # 语言切换组件
```

### 2.3 创建翻译资源文件

**英文资源 (en.ts)**:
- 包含所有界面文本的英文翻译
- 按组件/功能模块组织

**中文资源 (zh.ts)**:
- 包含所有界面文本的中文翻译
- 保持与英文资源相同的结构

### 2.4 修改现有组件

采用**非侵入式**方式：
1. 使用自定义Hook `useTranslation` 替代硬编码文本
2. 对于现有组件，只修改文本部分，不改动逻辑
3. 保持原有组件结构不变

**需要修改的文件**:
- `StatisticsApp.tsx` - 主应用组件
- `BasicStatisticsTab.tsx` - 基础统计组件
- `DistributionGenerator.tsx` - 分布生成器
- `ConfidenceIntervalsContainer.tsx` - 置信区间容器
- 其他子组件

### 2.5 集成语言切换控制器

在 `StatisticsApp.tsx` 中添加语言选择下拉菜单：
- 支持中英文切换
- 切换即时生效
- 自动保存到本地存储

### 2.6 实现本地存储功能

利用 `i18next-browser-languagedetector` 自动检测：
- URL参数
- localStorage
- 用户浏览器语言设置

---

## 三、文件修改清单

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `src/i18n/config.ts` | 新建 | i18next配置文件 |
| `src/i18n/resources/en.ts` | 新建 | 英文翻译资源 |
| `src/i18n/resources/zh.ts` | 新建 | 中文翻译资源 |
| `src/i18n/hooks/useTranslation.ts` | 新建 | 自定义翻译Hook |
| `src/i18n/components/LanguageSwitcher.tsx` | 新建 | 语言切换组件 |
| `src/main.tsx` | 修改 | 引入i18n配置 |
| `src/pages/StatisticsApp.tsx` | 修改 | 添加翻译和语言切换器 |
| `src/components/BasicStatisticsTab.tsx` | 修改 | 添加翻译 |
| `src/components/DistributionGenerator.tsx` | 修改 | 添加翻译 |
| `src/components/ConfidenceIntervalsContainer.tsx` | 修改 | 添加翻译 |
| `src/components/OneSampleMeanCI.tsx` | 修改 | 添加翻译 |
| `src/components/TwoSampleMeanCI.tsx` | 修改 | 添加翻译 |
| `src/components/ProportionCI.tsx` | 修改 | 添加翻译 |
| `src/components/PairedMeanCI.tsx` | 修改 | 添加翻译 |
| `src/components/TwoProportionCI.tsx` | 修改 | 添加翻译 |
| `src/components/MLEMoMTab.tsx` | 修改 | 添加翻译 |
| `src/components/HypothesisTestingTab.tsx` | 修改 | 添加翻译 |
| `src/components/SampleSizeCalculator.tsx` | 修改 | 添加翻译 |
| `src/components/GoodnessOfFitTest.tsx` | 修改 | 添加翻译 |
| `src/components/FileUploader.tsx` | 修改 | 添加翻译 |

---

## 四、翻译资源结构设计

采用**按功能模块**组织翻译键：

```typescript
{
  common: {
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    apply: 'Apply',
    generate: 'Generate',
  },
  statistics: {
    mean: 'Mean',
    median: 'Median',
    mode: 'Mode',
    standardDeviation: 'Standard Deviation',
    variance: 'Variance',
    // ...
  },
  dataInput: {
    title: 'Data Input & Generation',
    upload: 'Data Upload',
    generate: 'Data Generation',
    history: 'History Data',
    // ...
  },
  confidenceInterval: {
    title: 'Confidence Interval Analysis',
    meanDifference: 'Mean Difference',
    proportion: 'Proportion',
    // ...
  },
  // ...
}
```

---

## 五、风险评估与应对

| 风险 | 概率 | 影响 | 应对措施 |
|-----|------|------|---------|
| 翻译遗漏 | 中 | 部分文本未翻译 | 建立翻译完整性检查清单 |
| 组件修改引入bug | 低 | 功能异常 | 最小化修改范围，只改文本 |
| 语言切换不生效 | 低 | 用户体验差 | 使用i18next的React Hooks确保响应式更新 |
| 存储失效 | 低 | 语言偏好丢失 | 提供默认语言回退机制 |

---

## 六、使用文档

### 6.1 添加新翻译

1. 在 `src/i18n/resources/en.ts` 中添加英文翻译键值对
2. 在 `src/i18n/resources/zh.ts` 中添加对应的中文翻译
3. 在组件中使用 `useTranslation` Hook获取翻译

### 6.2 扩展支持语言

1. 在 `src/i18n/resources/` 下新建对应语言的资源文件（如 `ja.ts`）
2. 在 `src/i18n/config.ts` 中注册新语言
3. 在 `LanguageSwitcher` 组件中添加新语言选项

### 6.3 翻译键命名规范

- 使用小写字母和点号分隔（如 `common.save`）
- 按模块组织（如 `statistics.mean`）
- 避免过长的键名

---

## 七、测试计划

1. **功能测试**:
   - 验证中英文切换正常
   - 验证所有文本正确翻译
   - 验证语言偏好持久化

2. **兼容性测试**:
   - 验证原有功能不受影响
   - 验证在不同浏览器中的表现

3. **边界测试**:
   - 首次访问时的默认语言
   - localStorage被清除后的行为
   - 不支持的语言环境回退

---

## 八、预期成果

1. ✅ 中英文无缝切换功能
2. ✅ 完整的翻译资源文件
3. ✅ 语言切换控制器
4. ✅ 语言偏好本地存储
5. ✅ 不影响原有功能
6. ✅ 使用文档

---

*计划完成后，将开始实施。*
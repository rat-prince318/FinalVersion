# 国际化翻译修复计划

## 问题分析

通过检查代码，发现以下未翻译的英文文本：

### 1. OneSampleMeanCI.tsx
- `Dataset Distribution Information` - 数据集分布信息
- `Distribution Type` - 分布类型
- `Using t-distribution or normal approximation` - 使用t分布或正态近似

### 2. TwoSampleMeanCI.tsx
- `Assuming Equal Variances (Pooled)` - 假设方差相等（合并）
- `Not Assuming Equal Variances (Welch)` - 不假设方差相等（Welch）

### 3. PairedMeanCI.tsx
- `Before and after datasets must have the same length` - 前后数据集长度必须相同
- `Difference` - 差值

### 4. ProportionCI.tsx
- `Sample Proportion (p̂)` - 样本比例 (p̂)

## 修复方案

### 步骤1：更新翻译资源文件
在 `src/i18n/resources/en.ts` 和 `src/i18n/resources/zh.ts` 中添加缺失的翻译键值对

### 步骤2：修改组件文件
将硬编码的英文文本替换为翻译函数调用 `t('key')`

## 文件修改清单

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src/i18n/resources/en.ts` | 添加置信区间相关翻译 | 高 |
| `src/i18n/resources/zh.ts` | 添加置信区间相关翻译 | 高 |
| `src/components/OneSampleMeanCI.tsx` | 使用t()替换硬编码文本 | 高 |
| `src/components/TwoSampleMeanCI.tsx` | 使用t()替换硬编码文本 | 高 |
| `src/components/PairedMeanCI.tsx` | 使用t()替换硬编码文本 | 高 |
| `src/components/ProportionCI.tsx` | 使用t()替换硬编码文本 | 高 |

## 风险评估

- 低风险：仅修改文本内容，不影响业务逻辑
- 需要确保翻译键名统一，避免重复定义

## 验证方法

1. 运行 `npm run build` 确保项目能正常构建
2. 切换中英文语言，验证所有文本正确切换
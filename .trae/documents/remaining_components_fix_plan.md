# 剩余组件翻译修复计划

## 1. 问题分析

### 1.1 待修复组件列表

| 组件名称 | 当前状态 | 问题描述 |
|---------|---------|---------|
| PowerFunction.tsx | 部分修复 | 已添加翻译hook，但按钮点击事件仍引用旧函数名(calculatePower/calculateRequiredSampleSize)，UI文本未完全翻译 |
| TwoSampleDataGenerator.tsx | 未修复 | 完全缺少翻译支持，所有文本均为硬编码英文 |
| DataGeneratorContainer.tsx | 未修复 | 完全缺少翻译支持，所有文本均为硬编码英文 |

### 1.2 具体问题

**PowerFunction.tsx:**
- 第175行: `onClick={calculatePower}` 应改为 `onClick={calculatePowerFn}`
- 第183行: `onClick={calculateRequiredSampleSize}` 应改为 `onClick={calculateRequiredSampleSizeFn}`
- 第88行: `Hypothesis Test Type` 未翻译
- 第100行: `Null Hypothesis Mean (μ₀)` 未翻译
- 第111行: `Population Standard Deviation (σ)` 未翻译
- 第124行: `Sample Size (n)` 未翻译
- 第136行: `Significance Level (α)` 未翻译
- 第149行: `Test Type` 未翻译
- 第162行: `Effect Size (μ₁ - μ₀)` 未翻译
- 第179行: `Calculate Power` 未翻译
- 第187行: `Calculate Required Sample Size` 未翻译
- 第205行: `Analysis Results` 未翻译
- 第210行: `Power for Given Effect Size:` 未翻译
- 第213行: 结果解释文本未翻译
- 第220行: `Required Sample Size for 80% Power:` 未翻译
- 第223行: 结果解释文本未翻译
- 选项值未翻译（如 Z-test, T-test, Two-tailed Test 等）

**TwoSampleDataGenerator.tsx:**
- 所有UI文本均为硬编码英文
- 缺少 useTranslation hook
- 错误提示使用 alert() 而非统一的错误处理

**DataGeneratorContainer.tsx:**
- 所有UI文本均为硬编码英文
- 缺少 useTranslation hook

## 2. 修复方案

### 2.1 修复步骤

1. **修复 PowerFunction.tsx**:
   - 更新按钮点击事件引用
   - 添加所有UI文本的翻译键
   - 更新选项值的翻译

2. **修复 TwoSampleDataGenerator.tsx**:
   - 添加 useTranslation hook
   - 替换所有硬编码英文文本为翻译键
   - 修复错误处理方式

3. **修复 DataGeneratorContainer.tsx**:
   - 添加 useTranslation hook
   - 替换所有硬编码英文文本为翻译键

### 2.2 需要新增的翻译键

在 en.ts 和 zh.ts 中添加以下翻译模块：

**twoSampleDataGenerator:**
```typescript
twoSampleDataGenerator: {
  sample1: 'Sample 1',
  sample2: 'Sample 2',
  sampleSize: 'Sample Size',
  distributionType: 'Distribution Type',
  normalDistribution: 'Normal Distribution',
  uniformDistribution: 'Uniform Distribution',
  binomialDistribution: 'Binomial Distribution',
  mean: 'Mean (μ)',
  standardDeviation: 'Standard Deviation (σ)',
  minimumValue: 'Minimum Value (a)',
  maximumValue: 'Maximum Value (b)',
  successProbability: 'Success Probability (p)',
  generateTwoSamples: 'Generate Two Samples',
  errorOccurred: 'An error occurred during data generation'
}
```

**dataGeneratorContainer:**
```typescript
dataGeneratorContainer: {
  dataGeneration: 'Data Generation',
  singleSampleData: 'Single Sample Data',
  twoSampleData: 'Two Sample Data',
  pairedData: 'Paired Data'
}
```

## 3. 测试计划

### 3.1 单元测试

验证翻译功能是否正常工作：
- 语言切换时组件文本是否正确更新
- 翻译键是否正确映射
- 动态内容是否正确显示

### 3.2 功能测试

在中文语言模式下测试：
- PowerFunction 组件的所有按钮和文本是否正确显示中文
- TwoSampleDataGenerator 组件的所有表单字段是否正确显示中文
- DataGeneratorContainer 的标签页是否正确显示中文

### 3.3 兼容性测试

- 在不同浏览器中测试翻译显示
- 验证响应式布局下翻译文本是否正常显示

## 4. 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|-----|-----|-----|---------|
| 翻译键拼写错误 | 中 | 高 | 仔细检查翻译键名称，确保与资源文件一致 |
| 函数名引用错误 | 中 | 高 | 使用代码编辑器的自动补全功能 |
| 构建失败 | 低 | 高 | 修复完成后立即运行 build 验证 |
| 翻译内容不准确 | 低 | 中 | 仔细校对中文翻译内容 |

## 5. 时间估算

| 任务 | 预估时间 |
|-----|---------|
| 修复 PowerFunction.tsx | 30分钟 |
| 修复 TwoSampleDataGenerator.tsx | 45分钟 |
| 修复 DataGeneratorContainer.tsx | 20分钟 |
| 更新翻译资源文件 | 20分钟 |
| 测试验证 | 30分钟 |
| **总计** | **约2小时35分钟** |
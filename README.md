# Statistical Analysis Tool

一个功能强大的数据分析Web应用，提供完整的统计分析能力，支持数据生成、可视化和统计推断。

## 功能介绍

### 核心功能特性

#### 1. 数据输入与管理
- **多种数据输入方式**：支持直接输入数据、CSV文件上传
- **数据生成器**：支持单样本、双样本、配对样本的数据生成
- **多种概率分布**：支持正态分布、均匀分布、泊松分布等多种分布类型
- **数据集管理**：支持保存、加载、删除数据集，支持多选合并分析

#### 2. 统计分析工具
- **基本统计量计算**：均值、标准差、中位数、偏度、峰度等
- **置信区间估计**：单样本均值、双样本均值、比例、配对数据的置信区间
- **参数估计**：最大似然估计(MLE)和矩估计(MOM)
- **假设检验**：支持多种假设检验方法
- **拟合优度检验**：检验数据是否符合特定分布
- **样本量计算**：根据功效和效应量计算所需样本量

#### 3. 数据可视化
- **概率分布可视化**：展示各种概率分布的图形
- **统计图表**：直方图、QQ图等数据可视化

#### 4. 智能提示
- 自动检测数据是否符合正态分布
- 根据数据特征推荐合适的统计方法

### 目标用户群体
- 数据分析师和统计学家
- 科研人员和学生
- 需要进行统计分析的业务人员

### 核心价值主张
- **易用性**：无需安装，浏览器直接使用
- **全面性**：提供从数据生成到统计推断的完整流程
- **专业性**：基于成熟的统计方法和算法
- **可视化**：直观展示数据分布和分析结果

## 使用方法

### 环境配置要求
- Node.js >= 14.0.0
- npm 或 yarn 包管理器

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/yourusername/statistical-frontend.git

# 进入项目目录
cd statistical-frontend

# 安装依赖
npm install
```

### 启动命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 部署到GitHub Pages
npm run deploy
```

### 基本操作流程

1. **数据输入**
   - 在 "Data Input & Generation" 区域选择数据输入方式
   - 可以直接输入数据、上传CSV文件或生成模拟数据
   - 支持选择不同的概率分布生成数据

2. **数据管理**
   - 使用 "History Data" 标签页查看和管理已保存的数据集
   - 支持多选数据集进行合并分析

3. **统计分析**
   - 在 "Statistical Analysis" 区域选择分析类型
   - 支持基本统计量、置信区间、假设检验等多种分析

4. **查看结果**
   - 分析结果会实时显示在对应的标签页中
   - 支持可视化图表展示

### 常见使用场景

#### 场景一：教学演示
1. 使用数据生成器创建符合特定分布的数据集
2. 展示基本统计量的计算结果
3. 演示置信区间的概念

#### 场景二：数据分析
1. 上传CSV数据文件
2. 进行描述性统计分析
3. 进行假设检验和置信区间估计

#### 场景三：样本量计算
1. 使用样本量计算器
2. 输入预期效应量和功效
3. 获取所需样本量

## 技术架构

### 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | ^18.2.0 |
| 类型系统 | TypeScript | ^5.9.2 |
| 构建工具 | Vite | ^4.4.0 |
| UI组件库 | Chakra UI | ^2.7.1 |
| 图表库 | Recharts | ^2.8.0 |
| 数学计算 | mathjs | ^11.8.0 |
| 动画库 | Framer Motion | ^10.12.17 |
| 路由 | React Router DOM | ^6.14.2 |

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (Application)                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────┐   │
│  │ StatisticsApp │  │   Components  │  │    UI     │   │
│  │   (主应用)    │  │ (功能组件)    │  │ (Chakra)  │   │
│  └───────────────┘  └───────────────┘  └───────────┘   │
├─────────────────────────────────────────────────────────┤
│                    业务层 (Business)                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────┐   │
│  │ DataManager   │  │ Statistics    │  │  Charts   │   │
│  │ (数据管理)    │  │ (统计计算)    │  │ (图表生成) │   │
│  └───────────────┘  └───────────────┘  └───────────┘   │
├─────────────────────────────────────────────────────────┤
│                    基础设施层 (Infrastructure)          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────┐   │
│  │    Vite       │  │ TypeScript    │  │   npm     │   │
│  │  (构建工具)   │  │  (类型检查)   │  │ (依赖管理)│   │
│  └───────────────┘  └───────────────┘  └───────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 核心模块划分

#### 1. 数据输入模块
- `DataInputPanel`: 数据输入面板
- `FileUploader`: 文件上传组件
- `DistributionGenerator`: 分布数据生成器

#### 2. 数据管理模块
- `DatasetManager`: 数据集管理
- 支持数据集的保存、加载和删除

#### 3. 统计分析模块
- `BasicStatisticsTab`: 基本统计量
- `ConfidenceIntervalsContainer`: 置信区间
- `MLEMoMTab`: 参数估计
- `HypothesisTestingTab`: 假设检验
- `GoodnessOfFitTest`: 拟合优度检验
- `SampleSizeCalculator`: 样本量计算

#### 4. 可视化模块
- `ProbabilityDistribution`: 概率分布可视化
- 基于 Recharts 的图表组件

#### 5. 工具函数模块
- `statistics.ts`: 统计计算工具
- `dataGenerators.ts`: 数据生成工具

### 目录结构

```
src/
├── components/           # UI组件
│   ├── BasicStatisticsTab.tsx
│   ├── ConfidenceIntervalsContainer.tsx
│   ├── DataInputPanel.tsx
│   ├── DistributionGenerator.tsx
│   ├── FileUploader.tsx
│   ├── GoodnessOfFitTest.tsx
│   ├── HypothesisTestingTab.tsx
│   ├── MLEMoMTab.tsx
│   ├── ProbabilityDistribution.tsx
│   ├── SampleSizeCalculator.tsx
│   └── ...
├── pages/               # 页面组件
│   └── StatisticsApp.tsx
├── utils/               # 工具函数
│   ├── statistics.ts    # 统计计算
│   └── dataGenerators.ts # 数据生成
├── App.tsx              # 应用入口
├── main.tsx             # React入口
├── theme.ts             # Chakra主题配置
├── types.ts             # TypeScript类型定义
└── ...
```

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

### 提交代码

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 确保代码通过类型检查

### 测试

项目使用 Vite 构建工具，运行 `npm run build` 确保项目能正常构建。

## 许可证

本项目采用 ISC 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/yourusername/statistical-frontend/issues)
- 邮箱: your.email@example.com

---

**注意**: 本应用仅供学习和研究使用，实际数据分析请谨慎对待结果。

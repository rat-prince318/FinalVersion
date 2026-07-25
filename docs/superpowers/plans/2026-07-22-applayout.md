# AppLayout 共享布局组件 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建共享 AppLayout 组件，将 LanguageSwitcher 放入全局 header，所有页面自动拥有中英文切换功能。

**Architecture:** 新建 AppLayout 组件作为全局布局外壳，提供 header（标题 + LanguageSwitcher）和 `{children}` 插槽。App.tsx 用 AppLayout 包裹页面。StatisticsApp 移除原有的 header 部分。

**Tech Stack:** React 18 + TypeScript + Chakra UI + react-i18next

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/components/AppLayout.tsx`（新建）| 全局布局：Container + header（标题 + LanguageSwitcher）+ children |
| `src/App.tsx`（修改）| 用 `<AppLayout>` 包裹 `<StatisticsApp />` |
| `src/pages/StatisticsApp.tsx`（修改）| 移除 header 和 LanguageSwitcher 导入 |

---

### Task 1: 创建 AppLayout 组件

**Files:**
- Create: `src/components/AppLayout.tsx`

- [ ] **Step 1: 创建 AppLayout 组件文件**

```tsx
import React from 'react';
import { Container, Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../i18n/components/LanguageSwitcher';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <Container maxW="container.lg" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1" size="lg">
          {t('app.title')}
        </Heading>
        <LanguageSwitcher />
      </Flex>
      {children}
    </Container>
  );
};

export default AppLayout;
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit --pretty src/components/AppLayout.tsx`
Expected: No errors related to AppLayout.tsx

---

### Task 2: 修改 App.tsx — 用 AppLayout 包裹页面

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 添加 AppLayout 包裹**

将:
```tsx
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import StatisticsApp from './pages/StatisticsApp';

// ... theme config ...

function App() {
  return (
    <ChakraProvider theme={theme}>
      <StatisticsApp />
    </ChakraProvider>
  );
}
```

改为:
```tsx
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import StatisticsApp from './pages/StatisticsApp';
import AppLayout from './components/AppLayout';

// ... theme config ...

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AppLayout>
        <StatisticsApp />
      </AppLayout>
    </ChakraProvider>
  );
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit --pretty src/App.tsx`
Expected: No errors

---

### Task 3: 修改 StatisticsApp.tsx — 移除 header

**Files:**
- Modify: `src/pages/StatisticsApp.tsx`

- [ ] **Step 1: 移除 LanguageSwitcher 导入（第13行）**

删除:
```typescript
import LanguageSwitcher from '../i18n/components/LanguageSwitcher';
```

- [ ] **Step 2: 移除 Flex 导入（如不再需要）**

在 import 行中，从 Chakra UI 导入列表中移除 `Flex`（当前在第2行末尾）：
```typescript
// 之前
import { Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Divider, Alert, AlertIcon, Input, Button, Text, Checkbox, Stack, Textarea, Grid, Flex } from '@chakra-ui/react';

// 之后
import { Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Divider, Alert, AlertIcon, Input, Button, Text, Checkbox, Stack, Textarea, Grid } from '@chakra-ui/react';
```

- [ ] **Step 3: 移除 header 部分的 JSX（第215-220行）**

删除:
```tsx
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1" size="lg">
          {t('app.title')}
        </Heading>
        <LanguageSwitcher />
      </Flex>
```

保留 `return` 中 `Container` 内的其余内容不变。

- [ ] **Step 4: 同时移除 Container 和 Heading 导入（如不再需要）**

移除 header 后，StatisticsApp 中不再使用 `Container` 和 `Heading`。从 Chakra UI 导入列表中一并移除：

```typescript
// 最终导入
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Divider, Alert, AlertIcon, Input, Button, Text, Checkbox, Stack, Textarea, Grid } from '@chakra-ui/react';
```

- [ ] **Step 5: 调整 Container 和 py 属性**

移除 header 后，StatisticsApp 中的 `<Container maxW="container.lg" py={4}>` 也需要移除（现在由 AppLayout 提供容器），但保留容器内的内容。

将:
```tsx
  return (
    <Container maxW="container.lg" py={4}>
      {/* header 已删除 */}
      <Box mb={6} ...>
      ...
      </Box>
    </Container>
  );
```

改为:
```tsx
  return (
    <>
      <Box mb={6} ...>
      ...
      </Box>
    </>
  );
```

- [ ] **Step 6: 验证 TypeScript 编译**

Run: `npx tsc --noEmit --pretty`
Expected: No errors across the project

---

### Task 4: 功能验证

- [ ] **Step 1: 启动开发服务器检查**

Run: `npm run dev`
Expected: 应用正常启动，header 在页面顶部显示标题和语言切换下拉框

- [ ] **Step 2: 测试语言切换功能**

手动操作:
1. 点击 LanguageSwitcher 下拉框，切换至中文 → 界面文字变为中文
2. 切换回英文 → 界面文字变回英文
3. 刷新页面 → 语言偏好保持

- [ ] **Step 3: Commit**

```bash
git add src/components/AppLayout.tsx src/App.tsx src/pages/StatisticsApp.tsx docs/superpowers/
git commit -m "feat: extract AppLayout with global LanguageSwitcher header"
```

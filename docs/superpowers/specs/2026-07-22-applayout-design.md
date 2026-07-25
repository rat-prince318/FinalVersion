# AppLayout 共享布局组件 — 设计文档

## 目标

创建共享 `AppLayout` 组件，将 `LanguageSwitcher` 放入全局 header，使所有页面自动拥有中英文切换功能，无需每次手动添加。

## 改动文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/AppLayout.tsx` | 新建 | 全局布局，含 header（标题 + LanguageSwitcher）和 `{children}` |
| `src/App.tsx` | 修改 | 用 `<AppLayout>` 包裹 `<StatisticsApp />` |
| `src/pages/StatisticsApp.tsx` | 修改 | 移除顶部的 `<Flex>` header 和 `LanguageSwitcher` 导入（迁移到 AppLayout） |

## AppLayout 接口

```tsx
interface AppLayoutProps {
  children: React.ReactNode;
}
```

## 内部结构

```
<Container maxW="container.lg">
  <Flex>                          ← header
    <Heading> 标题 </Heading>       ← 左
    <LanguageSwitcher />           ← 右
  </Flex>
  {children}                      ← 页面主体
</Container>
```

- `Container` 和 padding 从 `StatisticsApp` 迁移过来
- `Heading` 使用 `t('app.title')` 保持与现有 i18n 一致
- `Flex` 使用 `justifyContent="space-between"` + `alignItems="center"`

## 使用方式

```tsx
// App.tsx
<AppLayout>
  <StatisticsApp />
</AppLayout>

// 以后新增页面
<AppLayout>
  <NewPage />
</AppLayout>
```

新增页面自动获得 header + 语言切换，零额外配置。

## 影响范围

- 视觉：无变化，header 位置和样式与当前一致
- 功能：无影响，LanguageSwitcher 行为不变
- 向后兼容：StatisticsApp 移除 header 后，`Container` 和 padding 由 AppLayout 提供，布局不变

# Web应用开发指南

## 如何配置AI密钥

为了安全地管理您的AI API密钥，我们使用环境变量的方式进行配置。请按照以下步骤操作：

### 步骤1：创建.env文件

1. 复制 `.env.example` 文件并重命名为 `.env`
2. 在 `.env` 文件中填写您的实际API密钥

### 步骤2：安全注意事项

- 永远不要将 `.env` 文件提交到代码仓库中
- 我们已经在 `.gitignore` 文件中包含了 `.env`，确保它不会被版本控制跟踪
- 不要在代码中硬编码API密钥
- 定期轮换您的API密钥以增强安全性

## 项目初始化

### 选择适合您的Web框架

根据您的需求，您可以选择以下任一方式初始化项目：

#### 使用Node.js + Express

```bash
# 初始化项目
npm init -y

# 安装必要的依赖
npm install express dotenv openai

# 创建.gitignore文件
echo "# Dependencies\nnode_modules/\n\n# Environment variables\n.env\n\n# Build files\ndist/\nbuild/\n\n# Logs\nlogs/\n*.log" > .gitignore

# 创建基本的服务器文件
mkdir src
# 创建服务器文件的代码将在下一步提供
```

#### 使用React + Vite

```bash
# 使用Vite创建React项目
npm create vite@latest . -- --template react

# 安装依赖
npm install

# 安装dotenv等工具
npm install dotenv vite-plugin-dotenv

# 确保.gitignore文件已创建
# 如果没有，可以手动创建类似上面的.gitignore文件
```

## 在代码中使用环境变量

### Node.js项目示例

创建 `src/server.js` 文件：

```javascript
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('AI增强的Web应用已启动！');
});

// AI相关的路由示例
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });
    
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### React项目示例

修改 `vite.config.js` 文件以支持环境变量：

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'vite-plugin-dotenv';

export default defineConfig({
  plugins: [react(), dotenv()],
});
```

在React组件中使用环境变量：

```javascript
// 在组件中使用环境变量
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// 注意：在前端应用中直接使用API密钥可能存在安全风险
// 建议在生产环境中，前端通过后端服务器中转调用AI API
```

## 后续步骤

1. 根据您选择的技术栈完成项目初始化
2. 配置您的 `.env` 文件
3. 开始开发您的AI增强Web应用
4. 定期更新依赖并确保安全性

祝您开发顺利！
# Duolingo Clone - 语言学习平台

<p align="center">
<img src="https://img.shields.io/badge/Next.js-15.4-blue" alt="Next.js">
<img src="https://img.shields.io/badge/React-19.1-cyan" alt="React">
<img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
<img src="https://img.shields.io/badge/Drizzle%20ORM-0.31-green" alt="Drizzle ORM">
<img src="https://img.shields.io/badge/PostgreSQL-Neon-purple" alt="Neon PostgreSQL">
<img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

<p align="center">
<strong>基于 Next.js 15 + Drizzle ORM 构建的全栈语言学习应用</strong>
</p>
<p align="center">
这是一个克隆 Duolingo 的项目，旨在提供一个交互式、游戏化的语言学习体验。
<br>
前端采用 <code>Next.js 15/React 19/Tailwind CSS</code>，后端使用 <code>Drizzle ORM</code> 与 <code>Neon PostgreSQL</code> 数据库交互，
<br>
并通过 <strong>Clerk 进行用户认证</strong>，实现了完整的在线学习闭环。
</p>
## 🚀 核心特性

### 💡 技术亮点

- **🏗️ 现代化全栈架构** - 采用 Next.js 15 App Router 和 Server Components，实现最佳的服务端渲染（SSR）和静态站点生成（SSG）实践。
- **🔒 安全的用户认证** - 集成 Clerk 实现简单、安全的注册、登录和用户管理。
- **⚡ 类型安全的数据库操作** - 使用 Drizzle ORM 操作 Neon 提供的 Serverless PostgreSQL 数据库，保证从数据库到 API 的类型安全。
- **🔄 状态管理** - 利用 Zustand 进行轻量、高效的客户端状态管理。
- **📱 响应式和美观的 UI** - 基于 Tailwind CSS 和 Radix UI 构建，确保在所有设备上都有一致且美观的用户体验。
- **📊 模块化设计** - 清晰的项目结构，将数据库、组件、路由和业务逻辑分离，易于维护和扩展。
- **🎤 智能语音合成 (TTS)** - 集成 OpenAI TTS API，为学习内容提供高质量的多语言语音合成，支持中文、英文、西班牙语、法语、日语等多种语言，并具备智能缓存机制。

### 🎨 用户体验

- **📖 交互式课程** - 通过课程、单元和课程挑战，提供结构化的学习路径。
- **🎮 游戏化学习** - 引入红心、积分和排行榜系统，激励用户持续学习。
- **🔊 多媒体学习** - 在挑战中集成图片和音频，丰富学习体验。
- **⚙️ 管理后台** - 内置 React Admin 管理面板，方便管理课程、课程、挑战等内容。
- **🌙 响应式设计** - 移动优先的设计理念，支持 PWA，并可根据系统自动切换深色/浅色主题。

## 🛠️ 技术栈

### Frontend (Next.js)

```typescript
Next.js 15             // App Router + Server Components
React 19               // 最新的 React 特性和 Hooks
TypeScript 5           // 类型安全的 JavaScript 超集
Tailwind CSS 4         // 原子化 CSS 框架
Radix UI               // 无障碍组件库
Lucide React           // 现代 SVG 图标库
Zustand                // 轻量级状态管理
```

### Backend & Database

```typescript
Drizzle ORM 0.31       // 类型安全的 SQL ORM
Neon PostgreSQL        // 无服务器数据库
Clerk                  // 用户认证和管理
React Admin            // 管理后台框架
OpenAI TTS API         // 智能语音合成服务
```

## 📚 架构详解

### 🏗️ 数据库 Schema 设计 (Drizzle)

项目的数据模型清晰地定义了学习内容和用户进度之间的关系。

- **`courses`**: 存储语言课程的基本信息。
- **`units`**: 将课程划分为更小的单元。
- **`lessons`**: 每个单元包含多个课程。
- **`challenges`**: 每个课程由一系列挑战组成，支持 `SELECT` 和 `ASSIST` 两种类型。
- **`challengeOptions`**: 为挑战提供选项。
- **`userProgress`**: 跟踪用户当前的学习进度、红心和积分。
- **`challengeProgress`**: 记录用户完成的挑战。
- **`userSubscription`**: 管理用户的订阅状态。
- **`audioCache`**: 缓存 TTS 生成的音频文件，避免重复生成相同内容的语音。

<!-- end list -->

```typescript
// src/db/schema.ts
import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// 课程表
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imgSrc: text("image_src").notNull(),
});

// 用户进度表
export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImgSrc: text("user_image_src").notNull().default("/icons/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
});

// 音频缓存表 (TTS)
export const audioCache = pgTable("audio_cache", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  languageCode: text("language_code").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ... 其他 schema 定义
```

### 📁 项目结构

```
duolingo/
├── app/                    # Next.js 15 App Router
│   ├── (main)/            # 主应用布局组
│   │   ├── courses/       # 课程选择页面
│   │   ├── learn/         # 学习主页面
│   │   ├── leaderboard/   # 排行榜页面
│   │   ├── quests/        # 任务页面
│   │   └── shop/          # 商店页面
│   ├── (marketing)/       # 营销页面布局组
│   ├── admin/             # React Admin 管理后台
│   ├── api/               # API 路由
│   └── lesson/            # 课程学习页面
├── components/            # 可复用组件
│   ├── ui/               # 基础 UI 组件 (Radix UI)
│   └── modals/           # 模态框组件
├── db/                   # 数据库相关
│   ├── schema.ts         # Drizzle ORM Schema
│   ├── queries.ts        # 数据库查询函数
│   └── drizzle.ts        # 数据库连接配置
├── actions/              # Server Actions
│   ├── challenge-progress.ts # 挑战进度管理
│   ├── text-to-speech.ts # TTS 语音合成功能
│   ├── user-progress.ts  # 用户学习进度管理
│   └── user-subscription.ts # 用户订阅管理
├── store/                # Zustand 状态管理
├── lib/                  # 工具函数和配置
├── scripts/              # 脚本工具
│   ├── pregenerate_audio.ts # 音频预生成脚本
│   ├── prod.ts           # 生产环境脚本
│   ├── reset.ts          # 数据库重置脚本
│   ├── seed.ts           # 数据库种子数据脚本
│   └── seed_cn.ts        # 中文数据种子脚本
└── public/               # 静态资源
    ├── audio/            # TTS 生成的音频文件
    │   ├── cn/           # 中文音频
    │   ├── en/           # 英文音频
    │   ├── es/           # 西班牙语音频
    │   └── ...           # 其他语言音频
    ├── flags/            # 国家旗帜图标
    └── icons/            # SVG 图标
```

### 🔄 模块化设计

**组件层次结构**

- **页面组件** (`app/` 目录) - 负责数据获取和页面布局
- **布局组件** (`components/`) - 提供可复用的 UI 结构
- **UI 组件** (`components/ui/`) - 基于 Radix UI 的原子级组件
- **业务组件** - 封装特定业务逻辑的复合组件

**数据层分离**

- **Schema 定义** (`db/schema.ts`) - 数据库表结构和关系
- **查询函数** (`db/queries.ts`) - 封装复杂的数据库查询逻辑
- **Server Actions** (`actions/`) - 处理数据变更操作
- **状态管理** (`store/`) - 客户端状态和模态框控制

## ⚡ 性能优化

### 🎯 性能指标

**构建优化结果**

```
┌ ○ (Static)   # 静态生成页面
├ ● (SSG)      # 静态站点生成
├ ƒ (Dynamic)  # 服务端渲染
└ ○ (Static)   # 静态资源

Route (app)                    Size     First Load JS
┌ ○ /                         142 B       87.2 kB
├ ○ /_not-found               142 B       87.2 kB
├ ƒ /admin                    142 B       87.2 kB
├ ƒ /api/challenges           0 B         0 B
├ ƒ /learn                    142 B       87.2 kB
└ ƒ /lesson/[lessonId]        142 B       87.2 kB
```

### 🚀 优化策略

**1. Next.js 15 优化**

- **App Router** - 利用新的路由系统实现更好的代码分割
- **Server Components** - 减少客户端 JavaScript 包大小
- **Streaming SSR** - 渐进式页面渲染，提升首屏加载速度
- **Image Optimization** - 自动图片优化和懒加载

**2. 数据库优化**

- **连接池** - Neon 的自动连接池管理
- **查询优化** - Drizzle ORM 的类型安全查询和索引优化
- **缓存策略** - Next.js 数据缓存和 Drizzle 查询缓存

**3. 资源优化**

- **代码分割** - 动态导入和路由级别的代码分割
- **Tree Shaking** - 移除未使用的代码
- **压缩优化** - Gzip/Brotli 压缩和资源最小化
- **CDN 加速** - 静态资源通过 Vercel Edge Network 分发

**4. 用户体验优化**

- **骨架屏** - 加载状态的优雅展示
- **预加载** - 关键路由和资源的预加载
- **离线支持** - PWA 特性和缓存策略
- **响应式设计** - 移动优先的自适应布局

## 🚀 快速开始

### 环境要求

- **Node.js** \>= 18.0
- **npm/pnpm/yarn** 包管理器
- **PostgreSQL** 数据库 (推荐使用 [Neon](https://neon.tech/))

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/xxMudCloudxx/duolingo.git
cd duolingo

# 安装依赖
npm install
```

### 环境配置

1.  **复制环境变量模板**

    ```bash
    cp .env.example .env
    ```

2.  **配置必要的环境变量**

    ```env
    # Neon 数据库连接字符串
    DATABASE_URL="<your_neon_database_url>"

    # Clerk 用户认证
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<your_clerk_publishable_key>"
    CLERK_SECRET_KEY="<your_clerk_secret_key>"

    # OpenAI TTS API (语音合成功能)
    OPENAI_API_KEY="<your_openai_api_key>"
    ```

### 数据库设置

```bash
# 推送 schema 到数据库
npm run db:push
```

### 启动开发服务器

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用。

## 🔧 开发指南

### 开发命令

```bash
# 开发环境
npm run dev              # 启动开发服务器

# 构建和部署
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 数据库管理
npm run db:studio        # 打开 Drizzle Studio
npm run db:push          # 推送 schema 到数据库
npm run db:seed          # 运行种子数据
npm run db:reset         # 重置数据库

# TTS 音频管理
npm run audio:generate # 预生成所有课程内容的音频文件

# 代码质量
npm run lint             # ESLint 检查
```

### 架构原则

- **单一职责** - 每个组件和函数都力求只做一件事。
- **类型安全** - 从数据库到前端 UI，全程使用 TypeScript 保证类型安全。
- **代码规范** - 使用 ESLint 和 Prettier 保证代码风格统一。

## 🎤 TTS 语音合成功能

### 功能特性

- **🌍 多语言支持** - 支持中文、英文、西班牙语、法语、日语等多种语言的高质量语音合成
- **🎯 智能语音映射** - 为不同语言分配专属的 OpenAI 语音模型，提供更自然的发音体验
- **⚡ 智能缓存机制** - 自动缓存生成的音频文件，避免重复生成，提升性能和用户体验
- **🔄 动态生成** - 支持实时生成音频，用户点击即可听到语音
- **📁 文件管理** - 按语言分类存储音频文件，便于管理和维护

### 技术实现

**核心组件：**

- `actions/text-to-speech.ts` - TTS 核心功能实现
- `scripts/pregenerate_audio.ts` - 批量音频预生成脚本
- `db/schema.ts` - audioCache 表定义
- `app/lesson/card.tsx` - 前端音频播放组件

**工作流程：**

1. 用户点击学习卡片时触发音频播放
2. 系统首先检查 audioCache 表中是否存在缓存
3. 如果缓存存在，直接播放缓存的音频文件
4. 如果缓存不存在，调用 OpenAI TTS API 生成音频
5. 将生成的音频保存到 `/public/audio/{languageCode}/` 目录
6. 更新数据库缓存记录，供下次使用

**语音模型映射：**

```typescript
const languageVoiceMap = {
  es: "nova", // 西班牙语
  fr: "echo", // 法语
  jp: "shimmer", // 日语
  cn: "onyx", // 中文
  hr: "fable", // 克罗地亚语
};
```

### 使用方式

**环境配置：**

```bash
# 设置 OpenAI API 密钥
OPENAI_API_KEY="your_openai_api_key"
```

**预生成音频：**

```bash
# 为所有课程内容预生成音频文件
npm run audio:generate
```

**实时生成：**

- 用户在学习过程中点击任意文本卡片
- 系统自动检测语言并生成对应的语音
- 音频文件自动缓存，提升后续访问速度

## 📄 许可证

本项目使用 [MIT]([duolingo/LICENSE at main · xxMudCloudxx/duolingo](https://github.com/xxMudCloudxx/duolingo/blob/main/LICENSE)) 许可证。

## 🤝 贡献指南

我们欢迎任何形式的贡献！请遵循以下步骤：

1.  Fork 项目仓库
2.  创建功能分支 (`git checkout -b feature/NewFeature`)
3.  提交更改 (`git commit -m 'Add some NewFeature'`)
4.  推送到分支 (`git push origin feature/NewFeature`)
5.  创建 Pull Request

## 🙏 致谢

本项目参照该课程：[Code with Antonio - Duolingo Clone 2024-8](https://www.codewithantonio.com/projects/duolingo-clone)

感谢以下优秀的开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Clerk](https://clerk.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://radix-ui.com/)
- [Neon](https://neon.tech/)

---

<div align="center">
<p>⭐ 如果这个项目对你有帮助，请给它一个 star！</p>
<a href="https://github.com/xxMudCloudxx/duolingo/stargazers">
<img src="https://img.shields.io/github/stars/xxMudCloudxx/duolingo?style=social" alt="GitHub stars">
</a>
<a href="https://github.com/xxMudCloudxx/duolingo/network/members">
<img src="https://img.shields.io/github/forks/xxMudCloudxx/duolingo?style=social" alt="GitHub forks">
</a>
</div>

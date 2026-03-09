# 前端设计规范 - 运动活力风格

> 本规范定义健身房前端的设计语言，确保 AI 生成统一、高质量的界面。

---

## 目录

- [设计理念](#设计理念)
- [配色方案](#配色方案)
- [字体规范](#字体规范)
- [组件规范](#组件规范)
- [动效规范](#动效规范)
- [页面模板](#页面模板)

---

## 设计理念

**运动活力风格** - 传达力量、能量、健康的生活方式

核心关键词：
- 动感、活力、专业、激情
- 视觉冲击力强，层次分明
- 深色背景为主，亮色点缀

---

## 配色方案

### 主色调

```css
/* 颜色变量定义 */
:root {
  /* 主背景 - 深色系 */
  --color-bg-primary: #0f0f0f;
  --color-bg-secondary: #1a1a1a;
  --color-bg-card: #242424;
  --color-bg-elevated: #2d2d2d;

  /* 主题色 - 活力橙 */
  --color-primary: #ff6b35;
  --color-primary-light: #ff8c5a;
  --color-primary-dark: #e55a2b;

  /* 强调色 - 金色 */
  --color-accent: #f5a623;
  --color-accent-light: #ffc107;

  /* 文字颜色 */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-text-muted: #666666;

  /* 功能色 */
  --color-success: #4ade80;
  --color-error: #f87171;
  --color-warning: #fbbf24;

  /* 渐变 */
  --gradient-primary: linear-gradient(135deg, #ff6b35 0%, #f5a623 100%);
  --gradient-hero: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
}
```

### 配色使用规则

| 场景 | 背景色 | 文字色 | 强调色 |
|------|--------|--------|--------|
| 页面主背景 | `#0f0f0f` | 白色 | 橙色 `#ff6b35` |
| 卡片背景 | `#242424` | 白色 | - |
| 按钮主色 | - | 白色 | `#ff6b35` 填充 |
| 按钮次要 | 透明 | `#ff6b35` | 边框 `#ff6b35` |
| 标题 | - | 白色 | - |
| 正文 | - | `#a0a0a0` | - |

---

## 字体规范

### 字体选择

```css
/* 标题字体 - 有力量感 */
--font-display: 'Noto Sans SC', 'PingFang SC', sans-serif;

/* 正文字体 - 易读 */
--font-body: 'Noto Sans SC', 'PingFang SC', sans-serif;

/* 数字/价格 - 现代感 */
--font-mono: 'DIN Alternate', 'Roboto Mono', monospace;
```

### 字号层级

```css
/* 标题层级 */
--text-xs: 0.75rem;    /* 12px - 辅助文字 */
--text-sm: 0.875rem;   /* 14px - 次要信息 */
--text-base: 1rem;      /* 16px - 正文 */
--text-lg: 1.125rem;    /* 18px - 小标题 */
--text-xl: 1.25rem;     /* 20px - 卡片标题 */
--text-2xl: 1.5rem;     /* 24px - 区块标题 */
--text-3xl: 1.875rem;   /* 30px - 页面标题 */
--text-4xl: 2.25rem;    /* 36px - Hero 标题 */
--text-5xl: 3rem;       /* 48px - 主视觉 */
```

### 字重

- 标题：`font-weight: 700` 或 `font-weight: 800`
- 正文：`font-weight: 400`
- 按钮：`font-weight: 600`

---

## 组件规范

### 按钮

```vue
<!-- 主按钮 -->
<button class="btn-primary">
  立即注册
</button>

<!-- 次按钮 -->
<button class="btn-secondary">
  了解更多
</button>

<!-- 按钮样式 -->
<style scoped>
.btn-primary {
  background: linear-gradient(135deg, #ff6b35 0%, #f5a623 100%);
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #ff6b35;
  border: 2px solid #ff6b35;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
}
</style>
```

### 卡片

```vue
<!-- 信息卡片 -->
<div class="card">
  <div class="card-icon">🏋️</div>
  <h3 class="card-title">专业教练</h3>
  <p class="card-desc">顶级教练团队，一对一指导</p>
</div>

<style scoped>
.card {
  background: #242424;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: #ff6b35;
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.15);
}

.card-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.card-title {
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.card-desc {
  color: #a0a0a0;
  font-size: 14px;
}
</style>
```

### 输入框

```vue
<input
  type="text"
  class="input"
  placeholder="请输入手机号"
/>

<style scoped>
.input {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  width: 100%;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.2);
}

.input::placeholder {
  color: #666;
}
</style>
```

---

## 动效规范

### 页面加载动画

```css
/* 渐入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 使用方式 */
.fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
}

/* 延迟递进 */
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
```

### 悬停效果

```css
/* 按钮悬停 */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
}

/* 卡片悬停 */
.card:hover {
  transform: translateY(-4px);
  border-color: #ff6b35;
}

/* 图标旋转 */
.icon:hover {
  transform: rotate(10deg) scale(1.1);
}
```

---

## 页面模板

### 首页 Hero 区

```vue
<template>
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="highlight">开启</span>你的
        <br />健身之旅
      </h1>
      <p class="hero-subtitle">
        专业教练团队 · 先进健身器材 · 多元化课程
      </p>
      <div class="hero-actions">
        <button class="btn-primary">立即加入</button>
        <button class="btn-secondary">了解更多</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
}

.hero-content {
  position: relative;
  text-align: center;
  z-index: 1;
}

.hero-title {
  font-size: 64px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin-bottom: 24px;
}

.hero-title .highlight {
  color: #ff6b35;
}

.hero-subtitle {
  font-size: 18px;
  color: #a0a0a0;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
```

### 数据展示区

```vue
<template>
  <section class="features">
    <div class="container">
      <h2 class="section-title">为什么选择我们</h2>
      <div class="feature-grid">
        <div class="feature-card" v-for="i in 3" :key="i">
          <div class="feature-icon">🏋️</div>
          <h3>专业指导</h3>
          <p>认证教练一对一指导</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 80px 0;
  background: #0f0f0f;
}

.section-title {
  text-align: center;
  font-size: 36px;
  color: white;
  margin-bottom: 48px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: #242424;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  border: 1px solid #333;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  color: white;
  font-size: 20px;
  margin-bottom: 8px;
}

.feature-card p {
  color: #a0a0a0;
}
</style>
```

---

## 设计检查清单

生成前端代码前检查：

- [ ] 是否使用深色背景 `#0f0f0f` 或 `#1a1a1a`
- [ ] 主题色是否为橙色 `#ff6b35`
- [ ] 是否有渐变效果（按钮、背景）
- [ ] 是否有 hover 动效
- [ ] 字体是否有层次（标题加粗）
- [ ] 是否有页面加载动画
- [ ] 卡片是否有阴影或边框高亮
- [ ] 图标是否使用 Emoji 或 SVG

---

## 下一步

- [组件规范](./component-guidelines.md) - 详细组件设计
- [Hook 规范](./hook-guidelines.md) - 状态管理
- [交付检查](./quality-guidelines.md) - 代码质量检查

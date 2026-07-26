# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概况
个人网站，React + Vite 单页面项目。全屏 WebGL 极光背景 + 居中旋转文字动画。

## 常用命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建产物
```

## 架构

```
src/
├── main.jsx                    # React 入口，挂载到 #root
├── App.jsx                     # 主页面：SoftAurora 全屏背景 + "我的"静态文字 + RotatingText
├── App.css                     # 全局样式、hero-text 布局、rotating-wrapper 紫色圆角框
└── components/
    ├── SoftAurora.jsx          # WebGL 极光背景 (ogl 库)，Perlin 噪声双色层
    ├── SoftAurora.css          # 全屏固定定位容器
    ├── RotatingText.jsx        # 逐字拆分旋转切换文字 (motion 库 AnimatePresence)
    └── RotatingText.css        # flex wrap 布局、无障碍 sr-only
```

## 关键依赖

- **ogl**: WebGL 渲染框架，替换了原生 WebGL，用于 SoftAurora 极光着色器
- **motion** (motion/react): 动画库，用于 RotatingText 的 AnimatePresence + 字符级 stagger 动画
- **React 19 + Vite 8**

## 注意事项

- 无测试框架、无 linting 配置，项目规模小无需引入
- `网页特效.txt` 是 SoftAurora 和 RotatingText 组件的原始参考文档，仅作备忘
- 修改 WebGL 着色器时注意 ogl 的 `Program` 传入 `vertex`/`fragment` 字符串（非 raw GLSL），uniforms 以 `{ value: ... }` 包裹

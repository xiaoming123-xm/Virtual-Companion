# Virtual Companion

<div align="center">

<img src=".github/images/atri.png" alt="Virtual Companion" width="280">

**轻量、私有、可定制的 3D AI 桌面伴侣**

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![Tauri](https://img.shields.io/badge/Tauri-Desktop-FFC131.svg?logo=tauri&logoColor=white)](https://tauri.app/)

[项目介绍](#项目介绍) · [核心功能](#核心功能) · [界面预览](#界面预览) · [安装使用](#安装使用) · [本地开发](#本地开发) · [参与贡献](#参与贡献)

</div>

## 项目介绍

Virtual Companion 是一款开源的 3D AI 桌面伴侣应用，集成大语言模型、离线语音识别、语音合成、长期记忆与 VRM 3D 渲染能力。

项目采用本地优先的设计思路，在兼顾隐私与可控性的同时，为角色设定、模型供应商、声音和 3D 形象提供灵活的自定义能力。

## 核心功能

- **多模型支持**：可接入主流云端大语言模型与本地 Ollama 服务。
- **角色自定义**：支持配置角色设定、立绘、语音和模型参数。
- **离线语音识别**：集成 SenseVoice-Small ONNX，实现低延迟本地识别。
- **多供应商语音合成**：支持多种 TTS 服务，并可为不同角色绑定声音。
- **长期记忆**：通过 LangGraph 管理结构化的短期与长期记忆。
- **3D 角色互动**：基于 React Three Fiber 与 VRM 实现实时渲染和动作驱动。
- **桌面端体验**：使用 Tauri 构建轻量、快速的原生桌面应用。

## 技术栈

- **前端**：React 19、Tailwind CSS、Framer Motion
- **3D 渲染**：React Three Fiber、VRM
- **后端**：FastAPI、Python 3.12、LangChain、LangGraph、aiosqlite
- **桌面容器**：Tauri
- **语音识别**：SenseVoice-Small ONNX
- **语音合成**：多供应商 TTS 接口，包括 GPT-SoVITS 等

## 界面预览

<div align="center">
  <img src=".github/images/chat-interface.png" alt="聊天界面" width="48%">
  <img src=".github/images/3D模型.png" alt="3D 模型界面" width="48%">
</div>

## 安装使用

1. 前往 [Releases](https://github.com/xiaoming123-xm/Virtual-Companion/releases) 下载最新版本。
2. 完成安装或解压后，启动应用程序。
3. 打开「设置」，配置大语言模型 API Key 或本地 Ollama 服务地址。
4. 根据需要配置角色、语音和 3D 模型，然后开始使用。

> 当前版本主要面向 Windows 10 / 11。

## 本地开发

### 环境要求

- Python 3.12+
- Node.js 18+
- Rust 1.77+
- 推荐使用 [uv](https://github.com/astral-sh/uv) 管理 Python 环境

### 启动项目

```bash
git clone https://github.com/xiaoming123-xm/Virtual-Companion.git
cd Virtual-Companion

uv run python scripts/release.py check

cd frontend
npm install
npm run tauri:dev
更完整的说明请查看：
[开发指南](docs/01-入门/开发指南.md)
[桌面构建与发布指南](docs/01-入门/桌面构建与发布指南.md)
[文档中心](docs/README.md)
参与贡献
欢迎提交 Issue、功能建议和 Pull Request。
Fork 本仓库。
创建功能分支：git checkout -b feat/your-feature。
提交修改：git commit -m "feat: add your feature"。
推送分支：git push origin feat/your-feature。
创建 Pull Request。
Star History

许可证
本项目基于 MIT License 开源。
<div align="center">
  <i>“毕竟我可是高性能的嘛！”</i>
</div>
```

其中项目标题已经改成 Virtual Companion。如果应用程序实际仍叫 ATRI Chat，只需把首行标题和项目介绍中的名称改回 ATRI Chat，仓库链接继续保留新地址即可。
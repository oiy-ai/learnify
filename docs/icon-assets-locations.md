# 系统图标和Logo资源位置文档

本文档记录了 Learnify 系统中所有图标、Logo 和品牌资源的位置。

## 主要 Logo 文件

### SVG 格式 Logo

- **主 Logo 文件**: `packages/frontend/core/public/imgs/logo.svg` （系统主要 Logo）
- **BlockSuite Playground**: `blocksuite/playground/public/logo.svg`
- **测试环境**: `tests/affine-cloud/e2e/logo.svg`
- **管理后台认证模块**: `packages/frontend/admin/src/modules/auth/logo.svg`
- **管理后台设置模块**: `packages/frontend/admin/src/modules/setup/logo.svg`

### PNG 格式 Logo

- **Affine 文字 Logo**:
  - `packages/frontend/core/public/imgs/affine-text-logo.png`
  - `packages/frontend/apps/web/dist/imgs/affine-text-logo.png`
  - `packages/frontend/apps/mobile/dist/imgs/affine-text-logo.png`

## Web 应用图标

### Favicon 系列（多尺寸）

位置：`packages/frontend/core/public/` 和 `packages/frontend/apps/web/dist/`

- `favicon.ico` - 标准 favicon 图标
- `favicon-32.png` - 32x32 像素
- `favicon-36.png` - 36x36 像素
- `favicon-48.png` - 48x48 像素
- `favicon-72.png` - 72x72 像素
- `favicon-96.png` - 96x96 像素
- `favicon-144.png` - 144x144 像素
- `favicon-192.png` - 192x192 像素
- `apple-touch-icon.png` - Apple 设备触摸图标

### 应用版本图标

位置：`packages/frontend/core/public/imgs/` 和对应的 dist 目录

- `app-icon-stable.ico` - 稳定版图标
- `app-icon-beta.ico` - Beta 版图标
- `app-icon-canary.ico` - Canary 版图标
- `app-icon-internal.ico` - 内部版图标

## Electron 桌面应用图标

位置：`packages/frontend/apps/electron/resources/icons/`

### 主应用图标

- `icon.png` - 主图标 PNG 格式
- `icon.ico` - Windows 图标
- `icon.icns` - macOS 图标

### 版本特定图标

#### 稳定版 (Stable)

- `icon_stable_64x64.png` - 64x64 像素
- `icon_stable_512x512.png` - 512x512 像素

#### Beta 版

- `icon_beta.png` - 主图标
- `icon_beta.ico` - Windows 图标
- `icon_beta.icns` - macOS 图标
- `icon_beta_64x64.png` - 64x64 像素
- `icon_beta_512x512.png` - 512x512 像素

#### Canary 版

- `icon_canary.png` - 主图标
- `icon_canary.ico` - Windows 图标
- `icon_canary.icns` - macOS 图标
- `icon_canary_64x64.png` - 64x64 像素
- `icon_canary_512x512.png` - 512x512 像素

#### 内部版 (Internal)

- `icon_internal.ico` - Windows 图标
- `icon_internal.icns` - macOS 图标
- `icon_internal_64x64.png` - 64x64 像素
- `icon_internal_512x512.png` - 512x512 像素

### 系统托盘图标

- `tray-icon.png` - 系统托盘图标

## iOS 应用图标

位置：`packages/frontend/apps/ios/App/App/Assets.xcassets/AppIcon.appiconset/`

- `light.png` - 浅色主题图标
- `dark@1024.png` - 深色主题图标（1024x1024）
- `dark@trans.png` - 深色主题透明背景图标

## 移动应用图标

位置：`packages/frontend/apps/mobile/dist/`

包含与 Web 应用相同的 favicon 系列和应用版本图标。

## 其他资源

### Google Cloud SDK

- `google-cloud-sdk/lib/googlecloudsdk/api_lib/meta/help_html_data/favicon.ico`

## 更新说明

### 替换图标指南

1. **SVG Logo 替换**：
   - 直接复制替换相应的 .svg 文件即可
   - 主文件位置：`packages/frontend/core/public/imgs/logo.svg`

2. **PNG/ICO/ICNS 图标替换**：
   - 需要从源 SVG 或高分辨率图片生成不同尺寸
   - 建议使用专业工具（如 ImageMagick、Sketch、Figma）生成
   - 确保保持正确的尺寸和格式要求

3. **Favicon 生成**：
   - 从高分辨率源图生成多种尺寸
   - 确保包含所有列出的尺寸以支持不同设备

4. **Electron 应用图标**：
   - Windows: 需要 .ico 格式（包含多种尺寸）
   - macOS: 需要 .icns 格式
   - Linux: 使用 .png 格式

5. **iOS 应用图标**：
   - 需要提供不同尺寸以适配不同设备
   - 注意深色模式和浅色模式的区别

## 注意事项

- 所有 dist 目录中的文件是构建生成的，源文件应该修改 public 或 src 目录中的对应文件
- 修改图标后需要重新构建应用以查看效果
- 某些平台（如 iOS、macOS）对图标格式和尺寸有严格要求
- 建议保留原始高分辨率源文件以便将来生成不同尺寸

## 最后更新

- 更新日期：2024年8月11日
- 所有 SVG 格式的 Logo 已统一替换为 `packages/frontend/core/public/imgs/logo.svg`

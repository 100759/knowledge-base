---
title: VitePress 使用技巧
description: 介绍 VitePress 的常用功能和写作技巧
date: 2026-08-11
category: 技术
tags:
  - VitePress
  - 写作
  - 技巧
---

# VitePress 使用技巧

VitePress 是一个基于 Vue 的静态文档站点生成器，非常适合构建文档和知识库。

## Markdown 扩展功能

### 链接

内部链接使用相对路径：

```
[使用指南](/guide/introduction)
```

外部链接直接使用完整 URL：

```
[GitHub](https://github.com)
```

### 提示框

VitePress 支持自定义容器：

::: info 信息
这是一条信息提示
:::

::: tip 提示
这是一条小技巧
:::

::: warning 警告
请注意这个注意事项
:::

::: danger 危险
这是一个危险警告
:::

::: details 详情
点击展开详情内容
:::

### 代码高亮

支持语法高亮：

```python
def greet(name):
    print(f"Hello, {name}!")

greet("知识库")
```

### 表格

| 功能 | 状态 | 说明 |
|------|------|------|
| 搜索 | ✅ | 内置全文搜索 |
| 暗黑模式 | ✅ | 自动/手动切换 |
| 响应式 | ✅ | 适配所有设备 |
| 后台管理 | ✅ | Decap CMS |

## 写作建议

1. **使用清晰的标题层级**：从 H1 开始，逐级使用 H2、H3
2. **善用列表**：列表比段落更易读
3. **添加代码示例**：技术文章中代码示例很重要
4. **使用图片**：图文并茂效果更好
5. **保持段落简短**：每段不超过 3-5 行

## 总结

VitePress 提供了丰富的 Markdown 扩展功能，让你的文章更加生动。在 Decap CMS 后台编辑器中，你可以使用富文本模式或直接编写 Markdown。

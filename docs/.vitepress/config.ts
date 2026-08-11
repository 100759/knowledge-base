import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// ========================================
// 自动侧边栏生成
// 新增/删除文章后，构建时自动更新侧边栏，无需手动维护
// ========================================

function getFileTitle(filePath: string, fallback: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    // 优先读取 frontmatter 中的 title
    const fmMatch = content.match(/^---[\s\S]*?title:\s*(.+?)\s*$/m)
    if (fmMatch) return fmMatch[1].replace(/['"]/g, '')
    // 其次读取第一个 # 标题
    const h1Match = content.match(/^#\s+(.+)$/m)
    if (h1Match) return h1Match[1]
  } catch {}
  return fallback
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

const dirTitleMap: Record<string, string> = {
  guide: '使用指南',
  articles: '知识文章',
  notes: '学习笔记',
  tutorials: '教程',
}

function getDirTitle(dirName: string): string {
  return dirTitleMap[dirName] || dirName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function getSidebarItems(dir: string, basePath: string): any[] {
  const items: any[] = []
  let entries: fs.Dirent[]

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return items
  }

  // index.md 排在最前
  const indexEntry = entries.find(e => e.name === 'index.md')
  if (indexEntry) {
    const fullPath = path.join(dir, 'index.md')
    items.push({
      text: getFileTitle(fullPath, '概述'),
      link: `${basePath}/`
    })
  }

  // 按文件名排序
  entries.sort((a, b) => a.name.localeCompare(b.name))

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'index.md') continue

    const fullPath = path.join(dir, entry.name)
    const relativePath = `${basePath}/${entry.name.replace(/\.md$/, '')}`

    if (entry.isDirectory()) {
      const subItems = getSidebarItems(fullPath, `${basePath}/${entry.name}`)
      if (subItems.length > 0) {
        items.push({
          text: getDirTitle(entry.name),
          collapsed: true,
          items: subItems
        })
      }
    } else if (entry.name.endsWith('.md')) {
      const name = entry.name.replace(/\.md$/, '')
      items.push({
        text: getFileTitle(fullPath, name),
        link: `${basePath}/${name}`
      })
    }
  }

  return items
}

function generateSidebar(docsDir: string): any[] {
  const sidebar: any[] = []
  let entries: fs.Dirent[]

  try {
    entries = fs.readdirSync(docsDir, { withFileTypes: true })
  } catch {
    return sidebar
  }

  // 按预定义顺序排列目录
  const dirOrder = ['guide', 'articles', 'notes', 'tutorials']
  const sortedEntries = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'public')
    .sort((a, b) => {
      const ai = dirOrder.indexOf(a.name)
      const bi = dirOrder.indexOf(b.name)
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.name.localeCompare(b.name)
    })

  for (const entry of sortedEntries) {
    const fullPath = path.join(docsDir, entry.name)
    const children = getSidebarItems(fullPath, `/${entry.name}`)
    if (children.length > 0) {
      sidebar.push({
        text: getDirTitle(entry.name),
        collapsed: false,
        items: children
      })
    }
  }

  return sidebar
}

// ========================================
// VitePress 配置
// ========================================

export default defineConfig({
  title: '知识库',
  description: '个人知识库 - 记录与分享',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }]
  ],

  themeConfig: {
    // 搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文章',
            buttonAriaLabel: '搜索文章'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },

    // 自动生成的侧边栏
    sidebar: generateSidebar(path.resolve(__dirname, '..')),

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '使用指南', link: '/guide/introduction' },
      { text: '管理后台', link: '/admin/' }
    ],

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/100759/knowledge-base' }
    ],

    // 页脚
    footer: {
      message: '基于 VitePress + Decap CMS 构建',
      copyright: 'Copyright © 2026'
    },

    // 大纲
    outline: {
      label: '本页目录',
      level: [2, 3]
    },

    // 文档底部
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    // 本地化
    lastUpdatedText: '最后更新',
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '语言'
  }
})

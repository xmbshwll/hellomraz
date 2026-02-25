---
title: 'Markdown Style Guide'
description: 'A guide to markdown features supported by this blog.'
pubDate: 2024-01-20
tags: ['markdown', 'guide', 'astro']
readingTime: '8 min read'
---

This post demonstrates the various markdown features you can use when writing blog posts.

## Headings

# H1 Heading (usually the page title)
## H2 Heading
### H3 Heading
#### H4 Heading

## Text Formatting

Regular text, **bold text**, *italic text*, ~~strikethrough text~~, and `inline code`.

## Lists

### Unordered List
- First item
- Second item
  - Nested item 1
  - Nested item 2
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

### Task List
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

## Links and Images

[External link](https://astro.build)
[Internal link](/about)

Images use standard markdown syntax:

![Alt text](https://astro.build/assets/press/astro-icon-light.svg)

## Blockquotes

> This is a blockquote. It's great for highlighting important information or quotes from other sources.
>
> It can span multiple lines.

## Code Blocks

Inline code: `const x = 1`

```javascript
// Code block with syntax highlighting
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

```python
# Python code
print("Hello from Python!")
```

## Tables

| Feature | Astro | Other |
|--------|-------|-------|
| Performance | Excellent | Varies |
| Ease of Use | Great | Varies |
| Static Output | Yes | Sometimes |

## Horizontal Rule

---

That's a wrap!

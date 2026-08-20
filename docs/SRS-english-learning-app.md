# EnglishFlow — 软件需求规格说明书（SRS）

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 创建日期 | 2026-08-20 |
| 产品代号 | EnglishFlow |
| 关联文档 | [PRD v1.3](./PRD-english-learning-app.md) |
| 文档类型 | 详细需求规格（开发/测试/设计可直接引用） |

---

## 目录

1. [文档说明](#1-文档说明)
2. [已确认产品决策](#2-已确认产品决策)
3. [系统边界与模块](#3-系统边界与模块)
4. [用户角色与权限矩阵](#4-用户角色与权限矩阵)
5. [功能需求详表（FR）](#5-功能需求详表fr)
6. [页面规格（UI）](#6-页面规格ui)
7. [业务规则（BR）](#7-业务规则br)
8. [数据模型](#8-数据模型)
9. [API 接口规格](#9-api-接口规格)
10. [状态机与流程](#10-状态机与流程)
11. [非功能需求（NFR）](#11-非功能需求nfr)
12. [错误码与异常处理](#12-错误码与异常处理)
13. [内容数据要求](#13-内容数据要求)
14. [新用户引导规格](#14-新用户引导规格)
15. [MVP 交付清单与验收](#15-mvp-交付清单与验收)
16. [附录](#16-附录)

---

## 1. 文档说明

### 1.1 目的

本文档在 PRD 基础上，将产品需求细化为**可开发、可测试、可验收**的规格，包括：

- 带编号的功能需求（FR-xxx）及验收标准
- 每个页面的元素、状态与交互
- 数据库表结构与字段约束
- REST API 请求/响应契约
- 业务规则与边界条件

### 1.2 读者

| 角色 | 使用方式 |
|------|----------|
| 产品经理 | 评审范围与验收标准 |
| 设计师 | 页面规格、状态、文案 |
| 前端 | 页面规格、API、状态机 |
| 后端 | 数据模型、API、业务规则 |
| 测试 | FR 验收、错误码、边界用例 |

### 1.3 需求优先级

| 标记 | 含义 |
|------|------|
| P0 | MVP 必须交付 |
| P1 | MVP 强烈建议，可次迭代 |
| P2 | v1.1 及以后 |

---

## 2. 已确认产品决策

| 维度 | 决策 |
|------|------|
| 产品方向 | 日常口语 |
| 平台 | 响应式 Web（Next.js） |
| 目标市场 | 中国大陆用户 |
| 界面语言 | 简体中文 |
| 内容形式 | 中英对照 |
| 登录 | 手机号 + 短信验证码（P0） |
| 部署 | 国内云 + ICP 备案 + 阿里云 OSS/RDS |
| 录音 | 浏览器 MediaRecorder |
| 不做 | 考试、商务英语、原生 App、境外登录 |

---

## 3. 系统边界与模块

### 3.1 系统上下文

```
┌──────────────┐     HTTPS      ┌─────────────────────────────┐
│  用户浏览器   │ ◄────────────► │  EnglishFlow Web 应用        │
│ (Chrome/Safari)│               │  Next.js + API + PostgreSQL  │
└──────────────┘               └───────────┬─────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
              阿里云 OSS              阿里云短信               阿里云 RDS/Redis
              (录音/音频)             (验证码)                 (业务数据)
```

### 3.2 功能模块

| 模块 ID | 名称 | 职责 |
|---------|------|------|
| M1 | 账户与认证 | 注册、登录、会话、注销 |
| M2 | 用户资料 | 水平、兴趣场景、学习目标 |
| M3 | 记忆卡片 | 牌组、卡片 CRUD、间隔复习 |
| M4 | 口语练习 | 题库、录音、回放、历史 |
| M5 | 每日推送 | 内容分发、用户动作 |
| M6 | Inbox | 待整理内容、生成卡片 |
| M7 | 学习统计 | 打卡、进度、Dashboard |
| M8 | 系统设置 | 目标、协议、隐私 |

---

## 4. 用户角色与权限矩阵

| 功能 | 访客 | 注册用户 | 说明 |
|------|:----:|:--------:|------|
| 浏览落地页 | ✅ | ✅ | |
| 手机号登录 | ✅ | ✅ | |
| 卡片复习 | ❌ | ✅ | |
| 创建卡片 | ❌ | ✅ | 上限 200 张活跃卡 |
| 口语录音 | ❌ | ✅ | 5 题/天 |
| 每日推送 | ❌ | ✅ | 5 条/天 |
| Inbox | ❌ | ✅ | |
| 导出/注销 | ❌ | ✅ | PIPL |

---

## 5. 功能需求详表（FR）

### M1 — 账户与认证

#### FR-AUTH-001 发送短信验证码（P0）

**描述：** 用户输入手机号，系统发送 6 位数字验证码。

| 项 | 规格 |
|----|------|
| 输入 | 11 位中国大陆手机号（1 开头） |
| 频率限制 | 同一手机号 60 秒内不可重发；同一 IP 每小时 ≤ 10 次 |
| 验证码 | 6 位数字，5 分钟有效，单次使用后作废 |
| 防刷 | 发送前需通过图形验证码（MVP 可用简单滑块/算术） |

**验收标准：**
- [ ] 合法手机号收到短信（测试环境可 Mock）
- [ ] 60 秒内重复请求返回 429
- [ ] 过期验证码登录失败并提示「验证码已过期」

---

#### FR-AUTH-002 手机号登录/注册（P0）

**描述：** 验证码正确则登录；若手机号不存在则自动注册。

| 项 | 规格 |
|----|------|
| 输入 | phone + code |
| 输出 | JWT access_token（2h）+ refresh_token（30d） |
| 新用户 | 创建 user 记录，`onboarding_completed = false` |

**验收标准：**
- [ ] 新用户首次登录自动创建账号
- [ ] 老用户登录保留历史数据
- [ ] Token 过期后可用 refresh 续期

---

#### FR-AUTH-003 退出登录（P0）

**描述：** 清除客户端 Token，服务端可选加入 refresh 黑名单。

**验收标准：**
- [ ] 退出后访问受保护页面跳转登录页

---

#### FR-AUTH-004 账号注销（P1）

**描述：** 用户申请注销，删除或匿名化个人数据（含录音）。

**验收标准：**
- [ ] 注销后手机号可重新注册为新账号
- [ ] OSS 录音文件同步删除

---

### M2 — 用户资料与 onboarding

#### FR-USER-001 新用户引导 — 场景兴趣（P0）

**描述：** 首次登录后选择感兴趣的场景（多选）。

| 选项 | 内部 code |
|------|-----------|
| 旅行出行 | travel |
| 餐厅点餐 | restaurant |
| 日常闲聊 | small_talk |
| 购物消费 | shopping |

**规则：** 至少选 1 项；影响默认推送排序（非过滤）。

---

#### FR-USER-002 新用户引导 — 英语水平（P0）

| 选项 | code | 说明 |
|------|------|------|
| 初级 | A2 | 能简单交流 |
| 中级 | B1 | 能描述经历和观点 |

**规则：** 影响口语题难度权重（A2 占 70%，B1 占 30% 当选择 A2 时）。

---

#### FR-USER-003 学习目标设置（P0）

| 字段 | 默认值 | 范围 |
|------|--------|------|
| 每日复习卡片数 | 15 | 5–50 |
| 每日口语题数 | 3 | 1–10 |

---

### M3 — 记忆卡片

#### FR-CARD-001 创建卡片（P0）

| 字段 | 必填 | 约束 |
|------|:----:|------|
| deck_id | 是 | 须为用户所属牌组 |
| front | 是 | 1–500 字符，英文为主 |
| back | 是 | 1–500 字符，中文释义 |
| card_type | 是 | phrase / sentence / dialogue_chunk |
| usage_hint | 否 | ≤ 200 字符 |
| scene | 否 | 枚举或自由文本 |

**业务规则 BR-CARD-001：** 活跃卡片总数 ≤ 200，超出时提示整理或删除。

**验收标准：**
- [ ] 创建成功后出现在对应牌组
- [ ] 新卡 `status = new`，`next_review_at = now`

---

#### FR-CARD-002 编辑/删除卡片（P0）

- 编辑后保留复习进度（不重置 interval）
- 删除为软删除（`deleted_at`），复习队列不再出现

---

#### FR-CARD-003 牌组管理（P0）

**MVP 预置牌组（系统级，不可删）：**

| name | scene | 说明 |
|------|-------|------|
| 日常寒暄 | small_talk | |
| 旅行出行 | travel | |
| 餐厅点餐 | restaurant | |
| 购物消费 | shopping | |
| 表达感受 | daily | |
| 闲聊拓展 | small_talk | |

**用户自定义牌组（P1）：** 最多 10 个。

---

#### FR-CARD-004 获取今日复习队列（P0）

**规则：**
1. 筛选：`next_review_at <= 当前时间` 且 `deleted_at IS NULL`
2. 排序：`next_review_at ASC`，同时间 `ease_factor ASC`（弱项优先）
3. 每日上限：用户设置的 `daily_review_goal`（默认 15），超出部分不计入「今日任务」但仍可「继续复习」

**输出：** 卡片列表 + 总数 + 今日已完成数

---

#### FR-CARD-005 提交复习评分（P0）

| 用户操作 | grade 值 | 间隔算法（见 BR-SRS-001） |
|----------|----------|---------------------------|
| 不认识 | again | 10 分钟后或 +1 天 |
| 模糊 | hard | interval × 1.2，min 1 天 |
| 认识 | good | 下一档：1→3→7→14→30 天 |

**每次提交记录：** `review_logs` 表一条。

**验收标准：**
- [ ] 提交后 `next_review_at` 立即更新
- [ ] 队列中下一张正确加载
- [ ] 全部完成后展示结算页

---

#### FR-CARD-006 复习模式（P1）

| 模式 | code | 行为 |
|------|------|------|
| 看英想中 | en_to_zh | 默认 |
| 看中想英 | zh_to_en | 交换正反面 |
| 听读 | listen | 自动播放 audio_url，隐藏英文 |

---

#### FR-CARD-007 从 Inbox/推送生成卡片（P0）

**输入：** inbox_item_id + target_deck_id

**生成规则：**
- 1 条推送 → 1 张 sentence 卡
- front = english，back = chinese，usage_hint = explanation
- source = push，scene 继承推送

---

### M4 — 口语练习

#### FR-SPEAK-001 获取随机口语题（P0）

**参数：**

| 参数 | 类型 | 默认 |
|------|------|------|
| scene | string? | 随机 |
| type | string? | 随机 |

**选题算法（MVP）：**
1. 过滤：`difficulty` 匹配用户 level 权重
2. 若指定 scene，80% 从该 scene 抽取
3. 排除用户当日已练过的 question_id
4. 20% 概率从「今日推送」关联题抽取（若存在）

**输出：** question 对象 + time_limit_sec（默认 60）+ sample_answer

---

#### FR-SPEAK-002 开始录音（P0）

**前端行为：**
1. 检测 `MediaRecorder` 与 `getUserMedia` 支持
2. 若在 MicroMessenger：展示「请在浏览器中打开」横幅
3. 用户点击「开始」→ 3 秒倒计时 → 录音
4. 最长 120 秒，到时自动停止

**验收标准：**
- [ ] Chrome Android / iOS Safari 可录可播
- [ ] 微信内置浏览器展示引导（不保证录音）

---

#### FR-SPEAK-003 上传录音（P0）

| 项 | 规格 |
|----|------|
| 格式 | webm/opus（前端）→ 服务端转 mp3 |
| 大小上限 | 10 MB |
| 存储 | OSS 私有 Bucket，签名 URL 访问（1h 有效） |

**请求：** multipart：`audio` + `question_id` + `duration_sec`

**配额：** 每用户每日最多 5 次成功上传；总存储 100 条，超出删最旧。

---

#### FR-SPEAK-004 回放与重录（P0）

- 上传前：本地 Blob 回放
- 上传后：OSS 签名 URL 回放
- 重录：同一 question 当日覆盖前一条（软删旧 attempt）

---

#### FR-SPEAK-005 参考回答展示（P0）

- 答题结束后展示 `sample_answer`（英文 + 可选中文）
- 文案：「参考说法（地道口语示范）」— 不用「标准答案」避免压力

---

#### FR-SPEAK-006 练习历史（P1）

- 列表：最近 30 条，按时间倒序
- 每条：题目摘要、日期、时长、回放按钮

---

#### FR-SPEAK-007 每日口语配额（P0）

- 每日 0:00（Asia/Shanghai）重置计数
- 超出 5 题提示「明日再来」或升级（V2）

---

### M5 — 每日推送

#### FR-PUSH-001 获取今日推送（P0）

**规则：**
- 每用户每日固定 5 条
- 按用户 scene 兴趣排序（感兴趣的 scene 优先）
- 全球内容库按日期轮换（同用户同天内容 deterministic）

**输出：** 5 条 push_item + 用户动作状态（未操作/已加入/已收藏/已忽略）

---

#### FR-PUSH-002 推送用户动作（P0）

| 动作 | code | 效果 |
|------|------|------|
| 加入背诵 | add_to_inbox | 创建 inbox_item，status=pending |
| 收藏 | favorite | 写入 favorites，不进 Inbox |
| 忽略 | dismiss | 不再展示，不写 Inbox |

**规则：** 每条推送只能执行一种终态动作，不可逆（MVP）。

---

#### FR-PUSH-003 推送内容展示（P0）

每条卡片展示：
- 场景标签（中文，如「餐厅点餐」）
- 英文原句（大号字体）
- 中文释义
- 用法讲解（可折叠）
- 迷你对话（可折叠，若有）
- 播放朗读按钮（若有 audio_url）

---

### M6 — Inbox

#### FR-INBOX-001 待整理列表（P0）

- 展示所有 `status = pending` 的 inbox_item
- 按加入时间倒序
- Badge 数量显示在导航「推送」和首页

---

#### FR-INBOX-002 整理为卡片（P0）

- 选择目标牌组 → 确认 → 调用 FR-CARD-007
- inbox_item.status → organized
- Toast：「已加入 [牌组名]，今日可复习」

---

#### FR-INBOX-003 从 Inbox 生成口语题（P1）

- 基于 inbox 内容生成 `type = push_review` 的临时题

---

#### FR-INBOX-004 忽略 Inbox 项（P0）

- status → dismissed，不再展示

---

### M7 — 学习统计与 Dashboard

#### FR-DASH-001 首页 Dashboard（P0）

**模块：**

| 模块 | 数据 | 交互 |
|------|------|------|
| 今日进度环 | 复习 x/15，口语 x/3 | 点击进入对应页 |
| 连续打卡 | N 天 | 展示 |
| Inbox 提醒 | 待整理 N 条 | 点击进入 Inbox |
| 快捷按钮 | 开始复习 / 练口语 / 看推送 | 跳转 |

**打卡规则 BR-STREAK-001：**
- 当日完成「复习 ≥1 张」或「口语 ≥1 题」即计为打卡
- 连续：昨日有打卡且今日有打卡则 +1，否则重置为 1

---

#### FR-DASH-002 学习统计页（P1）

- 本周复习卡片数、口语次数、掌握卡数、学习时长估算

---

### M8 — 设置与合规

#### FR-SET-001 隐私政策与用户协议（P0）

- 注册前勾选同意
- 设置页可再次查看
- 静态 Markdown 页面

#### FR-SET-002 数据导出（P1）

- 导出 JSON：卡片、复习记录、口语记录（不含录音文件，仅 URL 列表）

---

## 6. 页面规格（UI）

### 6.1 全局

| 项 | 规格 |
|----|------|
| 主色 | 建议蓝绿系（学习/信任），具体设计稿定 |
| 字体 | 中文：系统默认；英文：Inter 或 Source Sans |
| 断点 | mobile <768 / tablet 768–1023 / desktop ≥1024 |
| 加载 | 骨架屏；API 超时 15s 提示重试 |
| 空状态 | 每列表页必有插画 + 引导文案 + CTA |

**底部 Tab（mobile）：** 首页 | 复习 | 口语 | 推送 | 我的  
**侧边栏（desktop）：** 同上 + 设置入口

---

### 6.2 页面：登录 `/auth`

| 区域 | 元素 | 行为 |
|------|------|------|
| Logo + Slogan | 静态 | 「每天学几句，敢开口说」 |
| 手机号输入 | input tel | 11 位校验 |
| 图形验证码 | P0 | 发送短信前 |
| 验证码输入 | input | 6 位 |
| 获取验证码 | button | 60s 倒计时 |
| 登录按钮 | primary | 提交 |
| 协议勾选 | checkbox | 未勾选不可登录 |

**错误态：** 手机号格式错误、验证码错误、网络失败

---

### 6.3 页面：Onboarding `/onboarding`

**Step 1 — 场景兴趣（多选卡片）**  
**Step 2 — 英语水平（单选）**  
**Step 3 — 体验复习（嵌入 3 张示例卡，不可跳过评分）**  
**Step 4 — 体验口语（1 道 restaurant 情景题）**  
**Step 5 — 完成，跳转 /home**

进度条：5 步指示器

---

### 6.4 页面：首页 `/home`

```
┌─────────────────────────────────────┐
│ 你好，{昵称/手机号后4位}    连续 N 天 │
├─────────────────────────────────────┤
│ [环形进度] 今日复习 8/15             │
│ [环形进度] 今日口语 1/3              │
├─────────────────────────────────────┤
│ [开始复习]  [练口语]  [今日推送]      │
├─────────────────────────────────────┤
│ Inbox 待整理 (3)              查看 > │
└─────────────────────────────────────┘
```

---

### 6.5 页面：卡片复习 `/review`

**状态：** loading | empty（无待复习）| active | summary

**active 布局：**
```
场景标签 [餐厅点餐]
┌─────────────────────────┐
│   Can I get this to go? │  ← front
│                         │
│      [显示答案]          │
└─────────────────────────┘
进度：第 3 / 15 张

// 显示答案后
┌─────────────────────────┐
│ 我可以打包吗？            │  ← back
│ 💡 点餐时说要带走         │  ← usage_hint
│ 🔊 播放                  │
└─────────────────────────┘
[不认识]  [模糊]  [认识]
```

**summary：** 完成数、认识率、明日待复习、返回首页

**键盘（desktop）：** Space=显示答案，1/2/3=评分

---

### 6.6 页面：口语练习 `/speaking`

**模块：**
- 场景筛选 chips（全部/旅行/餐厅/闲聊…）
- 题目区：类型标签 + 英文题干 + 中文提示（若有）
- 微信环境警告条（条件显示）
- 录音区：倒计时 → 计时器 → 波形（可选 P1）
- 按钮：开始 / 完成 / 重录
- 结果区：回放 + 参考回答

---

### 6.7 页面：每日推送 `/push`

- Tab：今日推送 | Inbox (n)
- 推送列表：卡片式，每条 3 操作按钮
- 已操作项显示状态标签

---

### 6.8 页面：Inbox `/inbox`

- 列表项：英文 + 中文 + 加入时间
- 操作：选择牌组 ▼ + 「生成卡片」| 「忽略」

---

### 6.9 页面：我的 `/profile`

- 学习统计摘要
- 牌组管理入口
- 口语历史入口
- 设置入口

---

### 6.10 页面：设置 `/settings`

- 每日目标滑块
- 麦克风权限说明
- 隐私政策 / 用户协议
- 退出登录
- 账号注销（P1）
- 导出数据（P1）

---

## 7. 业务规则（BR）

### BR-SRS-001 间隔重复算法（MVP）

```text
初始：interval_days = 0, ease_factor = 2.5, status = new

grade = again:
  interval_days = 0
  next_review_at = now + 10 minutes（或次日 0:00 若当日已复习 ≥3 次）
  status = relearning

grade = hard:
  interval_days = max(1, round(interval_days * 1.2))
  ease_factor = max(1.3, ease_factor - 0.15)
  next_review_at = now + interval_days
  status = learning

grade = good:
  若 interval_days in (0,1,3,7,14): 取下一档 1→3→7→14→30
  否则 interval_days = min(30, round(interval_days * ease_factor))
  ease_factor = min(3.0, ease_factor + 0.1)
  next_review_at = now + interval_days
  若 interval_days >= 21: status = mastered
  否则 status = learning
```

### BR-STREAK-001 打卡

- 时区：`Asia/Shanghai`
- 条件：当日 `review_logs.count >= 1` OR `speaking_attempts.count >= 1`
- 存储：`user_streaks` 表

### BR-QUOTA-001 配额重置

- 每日 00:00 Asia/Shanghai 重置 `daily_speaking_count`

### BR-CONTENT-001 推送去重

- 同一用户 30 天内不重复推送相同 `content_id`

---

## 8. 数据模型

### 8.1 ER 关系概览

```
users 1──* decks 1──* cards
users 1──* review_logs
users 1──* speaking_attempts
users 1──* inbox_items
users 1──* push_user_actions
push_contents 1──* push_user_actions
speaking_questions 1──* speaking_attempts
inbox_items *──1 push_contents (optional)
cards *──1 inbox_items (optional, source)
```

### 8.2 表结构

#### users

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| phone | VARCHAR(11) | UNIQUE, NOT NULL | |
| nickname | VARCHAR(50) | | 可选 |
| level | ENUM | A2, B1 | 默认 A2 |
| scene_interests | JSONB | | ["travel","restaurant"] |
| daily_review_goal | INT | DEFAULT 15 | |
| daily_speaking_goal | INT | DEFAULT 3 | |
| onboarding_completed | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | | |
| deleted_at | TIMESTAMPTZ | | 软删 |

#### decks

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK, NULL | NULL=系统牌组 |
| name | VARCHAR(100) | NOT NULL | |
| scene | VARCHAR(50) | | |
| is_system | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | | |

#### cards

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK | |
| deck_id | UUID | FK | |
| front | TEXT | NOT NULL | |
| back | TEXT | NOT NULL | |
| card_type | ENUM | phrase, sentence, dialogue_chunk | |
| scene | VARCHAR(50) | | |
| usage_hint | VARCHAR(200) | | |
| audio_url | VARCHAR(500) | | |
| source | ENUM | manual, push, import | |
| ease_factor | DECIMAL(4,2) | DEFAULT 2.50 | |
| interval_days | INT | DEFAULT 0 | |
| next_review_at | TIMESTAMPTZ | NOT NULL | |
| status | ENUM | new, learning, mastered, relearning | |
| inbox_item_id | UUID | FK NULL | |
| deleted_at | TIMESTAMPTZ | | |

**索引：** `(user_id, next_review_at)` WHERE deleted_at IS NULL

#### review_logs

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK |
| card_id | UUID | FK |
| grade | ENUM | again, hard, good |
| reviewed_at | TIMESTAMPTZ | |

#### speaking_questions

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| type | ENUM | small_talk, travel, restaurant, push_review, ... |
| scene | VARCHAR(50) | |
| difficulty | ENUM | A2, B1 |
| prompt_en | TEXT | 英文题干 |
| prompt_zh | TEXT | 中文提示 |
| sample_answer_en | TEXT | |
| sample_answer_zh | TEXT | |
| time_limit_sec | INT | DEFAULT 60 |
| is_active | BOOLEAN | DEFAULT true |

#### speaking_attempts

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK |
| question_id | UUID | FK |
| audio_url | VARCHAR(500) | OSS path |
| duration_sec | INT | |
| transcript | TEXT | v1.1 |
| created_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

#### push_contents（内容库，运营维护）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| content_type | ENUM | phrase, sentence, mini_dialogue |
| scene | VARCHAR(50) | |
| english | TEXT | |
| chinese | TEXT | |
| explanation | TEXT | |
| dialogue | TEXT | |
| difficulty | ENUM | A2, B1 |
| audio_url | VARCHAR(500) | |
| day_index | INT | 用于轮换 |

#### push_user_actions

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK |
| push_content_id | UUID | FK |
| push_date | DATE | |
| action | ENUM | add_to_inbox, favorite, dismiss |

**唯一：** `(user_id, push_content_id, push_date)`

#### inbox_items

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK |
| push_content_id | UUID | FK NULL |
| english | TEXT | 冗余存储 |
| chinese | TEXT | |
| explanation | TEXT | |
| scene | VARCHAR(50) | |
| status | ENUM | pending, organized, dismissed |
| created_at | TIMESTAMPTZ | |

#### user_streaks

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | UUID | PK, FK |
| current_streak | INT | DEFAULT 0 |
| longest_streak | INT | DEFAULT 0 |
| last_checkin_date | DATE | |

#### sms_codes（可选 Redis 替代）

| 字段 | 类型 | 说明 |
|------|------|------|
| phone | VARCHAR(11) | |
| code_hash | VARCHAR | |
| expires_at | TIMESTAMPTZ | |

---

## 9. API 接口规格

**通用约定：**
- Base URL：`https://api.example.com/v1`
- 认证：`Authorization: Bearer <access_token>`
- 时区：服务端存储 UTC，展示按 Asia/Shanghai
- 响应格式：`{ "data": ..., "error": null }` 或 `{ "data": null, "error": { "code", "message" } }`

### 9.1 认证

#### POST /auth/sms/send

```json
// Request
{ "phone": "13800138000", "captcha_token": "..." }

// Response 200
{ "data": { "expires_in": 300, "retry_after": 60 } }
```

#### POST /auth/sms/login

```json
// Request
{ "phone": "13800138000", "code": "123456" }

// Response 200
{
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 7200,
    "is_new_user": true,
    "onboarding_completed": false
  }
}
```

#### POST /auth/refresh

#### POST /auth/logout

---

### 9.2 用户

#### GET /users/me

#### PATCH /users/me

```json
{ "level": "B1", "scene_interests": ["travel"], "daily_review_goal": 20 }
```

#### POST /users/me/onboarding/complete

---

### 9.3 Dashboard

#### GET /dashboard

```json
{
  "data": {
    "streak": { "current": 5, "longest": 12 },
    "review": { "done": 8, "goal": 15, "due_total": 22 },
    "speaking": { "done": 1, "goal": 3, "remaining_quota": 4 },
    "inbox_pending": 3
  }
}
```

---

### 9.4 卡片与复习

#### GET /decks

#### POST /cards

#### PATCH /cards/:id

#### DELETE /cards/:id

#### GET /review/today

```json
{
  "data": {
    "cards": [ { "id", "front", "back", "scene", "usage_hint", "audio_url", "status" } ],
    "total_due": 22,
    "goal": 15,
    "completed_today": 8
  }
}
```

#### POST /review/:cardId/grade

```json
// Request
{ "grade": "good" }

// Response
{ "data": { "next_review_at": "2026-08-23T00:00:00+08:00", "status": "learning" } }
```

---

### 9.5 口语

#### GET /speaking/questions/random?scene=restaurant

#### POST /speaking/attempts

```
Content-Type: multipart/form-data
- question_id
- duration_sec
- audio (file)
```

#### GET /speaking/attempts?limit=30

---

### 9.6 推送与 Inbox

#### GET /push/today

#### POST /push/:contentId/action

```json
{ "action": "add_to_inbox" }
```

#### GET /inbox

#### POST /inbox/:id/organize

```json
{ "deck_id": "uuid" }
```

#### POST /inbox/:id/dismiss

---

## 10. 状态机与流程

### 10.1 推送项用户状态

```
[未操作] --add_to_inbox--> [已加入 Inbox]
[未操作] --favorite--> [已收藏]
[未操作] --dismiss--> [已忽略]
```

### 10.2 Inbox 项状态

```
pending --organize--> organized
pending --dismiss--> dismissed
```

### 10.3 卡片学习状态

```
new --首次复习--> learning
learning --good×N--> mastered
any --again--> relearning --good--> learning
```

### 10.4 口语录音流程（前端）

```
idle → countdown(3s) → recording → preview → uploading → done
                  ↘ cancel → idle
recording → max_duration → preview
preview → retry → countdown
```

---

## 11. 非功能需求（NFR）

| ID | 类别 | 要求 |
|----|------|------|
| NFR-001 | 性能 | 首屏 LCP < 2.5s（4G） |
| NFR-002 | 性能 | API P95 < 800ms |
| NFR-003 | 安全 | 全站 HTTPS，HSTS |
| NFR-004 | 安全 | JWT 密钥轮换机制 |
| NFR-005 | 隐私 | 数据存储中国大陆 |
| NFR-006 | 隐私 | 录音私有读，OSS 不公开 List |
| NFR-007 | 可用性 | 月度可用性 ≥ 99.5% |
| NFR-008 | 兼容 | 微信内置浏览器友好降级 |
| NFR-009 | 日志 | 接口访问日志保留 30 天 |
| NFR-010 | 备份 | RDS 自动备份 7 天 |

---

## 12. 错误码与异常处理

| code | HTTP | 用户文案（中文） |
|------|------|------------------|
| AUTH_INVALID_PHONE | 400 | 请输入正确的手机号 |
| AUTH_INVALID_CODE | 400 | 验证码错误或已失效 |
| AUTH_RATE_LIMIT | 429 | 操作太频繁，请稍后再试 |
| AUTH_CAPTCHA_FAILED | 400 | 验证失败，请重试 |
| QUOTA_CARD_LIMIT | 403 | 卡片数量已达上限（200 张） |
| QUOTA_SPEAKING_DAILY | 403 | 今日口语练习次数已用完 |
| QUOTA_STORAGE | 403 | 录音存储已满，请删除旧录音 |
| RECORDING_NOT_SUPPORTED | 400 | 当前浏览器不支持录音，请使用 Chrome 或 Safari 打开 |
| RESOURCE_NOT_FOUND | 404 | 内容不存在或已删除 |
| INTERNAL_ERROR | 500 | 服务异常，请稍后重试 |

---

## 13. 内容数据要求

### 13.1 MVP 最低内容量

| 类型 | 数量 | 说明 |
|------|------|------|
| push_contents | ≥ 150 条 | 覆盖 30 天 × 5 条/天 |
| speaking_questions | ≥ 80 题 | 覆盖 6 场景 × 多题型 |
| 系统预置卡片 | 每牌组 ≥ 10 张 | onboarding 体验用 |

### 13.2 场景分布建议

| scene | 推送占比 | 口语题占比 |
|-------|----------|------------|
| restaurant | 20% | 20% |
| travel | 25% | 25% |
| small_talk | 25% | 25% |
| shopping | 15% | 15% |
| daily | 15% | 15% |

### 13.3 内容质量检查清单

- [ ] 每条英文 ≤ 80 字符为宜
- [ ] 中文释义准确口语化
- [ ] 含 usage_hint 或 explanation
- [ ] 无考试词汇标签
- [ ] 无政治/敏感内容

---

## 14. 新用户引导规格

| 步骤 | 页面 | 完成条件 |
|------|------|----------|
| 1 | 登录 | Token 有效 |
| 2 | 选场景 | ≥1 项，写入 users.scene_interests |
| 3 | 选水平 | A2 或 B1 |
| 4 | 体验复习 3 张 | 3 次 grade 提交 |
| 5 | 体验口语 1 题 | 1 次 attempt 上传成功 |
| 6 | 查看推送 | 滑动浏览 ≥1 条 |
| 7 | 加入 Inbox | 1 次 add_to_inbox |
| 8 | 生成卡片 | 1 次 organize |
| 9 | onboarding_completed = true | 进入 /home |

**时长目标：** 3–5 分钟

---

## 15. MVP 交付清单与验收

### 15.1 功能交付清单

| # | 功能 | FR 编号 | P0 |
|---|------|---------|:--:|
| 1 | 短信登录 | FR-AUTH-001~002 | ✅ |
| 2 | 新用户引导 | FR-USER-001~003, 14 章 | ✅ |
| 3 | 首页 Dashboard | FR-DASH-001 | ✅ |
| 4 | 今日复习 | FR-CARD-004~005 | ✅ |
| 5 | 创建/编辑卡片 | FR-CARD-001~002 | ✅ |
| 6 | 系统牌组 | FR-CARD-003 | ✅ |
| 7 | 随机口语+录音 | FR-SPEAK-001~005 | ✅ |
| 8 | 今日推送 | FR-PUSH-001~003 | ✅ |
| 9 | Inbox 整理 | FR-INBOX-001~002 | ✅ |
| 10 | 从推送生成卡片 | FR-CARD-007 | ✅ |
| 11 | 设置与协议 | FR-SET-001 | ✅ |
| 12 | 微信浏览器引导 | FR-SPEAK-002 | ✅ |

### 15.2 端到端验收场景

**场景 A — 新用户首日**
1. 手机号登录 → onboarding 完成 → 首页显示进度 0/15, 0/3
2. 完成 5 张复习 → 进度更新
3. 练 1 道口语并上传 → 进度 1/3
4. 推送加入 Inbox → 生成卡片 → 复习队列出现新卡

**场景 B — 老用户次日**
1. 登录 →  streak +1（若昨日已打卡）
2. 复习到期卡 → 间隔更新正确
3. 口语配额重置为 0/5

**场景 C — 微信打开**
1. UA 含 MicroMessenger → 口语页展示「在浏览器中打开」

**场景 D — 配额边界**
1. 第 201 张卡片创建失败 QUOTA_CARD_LIMIT
2. 第 6 次口语上传失败 QUOTA_SPEAKING_DAILY

---

## 16. 附录

### 16.1 与 PRD 关系

| PRD 章节 | SRS 对应 |
|----------|----------|
| 产品概述 | §2 |
| 功能需求 | §5 |
| 页面清单 | §6 |
| 数据/API | §8、§9 |
| 非功能 | §11 |
| MVP 范围 | §15 |

### 16.2 文档修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-08-20 | 首版详细需求规格，对齐 PRD v1.3 |

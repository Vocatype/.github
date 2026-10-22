// 조직 프로필의 개발 기록을 갱신한다.
// Vocatype/vocatype main의 커밋으로 잔디 그래프(라이트·다크 SVG)를 그린다. 외부 패키지 없이 Node 20+에서 돈다.
import { writeFile } from 'node:fs/promises'

const REPO = process.env.SOURCE_REPO ?? 'Vocatype/vocatype'
const BRANCH = process.env.SOURCE_BRANCH ?? 'main'
const TOKEN = process.env.GITHUB_TOKEN ?? ''
const TIME_ZONE = 'Asia/Seoul'
const WEEKS = 26
const SVG = (theme) => new URL(`../profile/activity-${theme}.svg`, import.meta.url)

async function api(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
  })
  if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`)
  return response.json()
}

async function allCommits() {
  const out = []
  for (let page = 1; ; page++) {
    const batch = await api(`/repos/${REPO}/commits?sha=${BRANCH}&per_page=100&page=${page}`)
    out.push(...batch)
    if (batch.length < 100) return out
  }
}

/** 한국 시간 기준 YYYY-MM-DD */
const dayOf = (date) => new Date(date).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
const addDays = (day, n) => {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const weekday = (day) => new Date(`${day}T00:00:00Z`).getUTCDay()
const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const THEMES = {
  light: { text: '#1f2328', muted: '#59636e', empty: '#ebedf0', levels: ['#dcd7fe', '#b1a7fd', '#8677fc', '#5a48e8'] },
  dark: { text: '#f0f6fc', muted: '#9198a1', empty: '#21262d', levels: ['#2e2861', '#4a3fb0', '#7465fb', '#b3a9ff'] },
}
const level = (count) => (count === 0 ? -1 : count < 5 ? 0 : count < 15 ? 1 : count < 40 ? 2 : 3)

function renderSvg(theme, perDay, today, stats) {
  const t = THEMES[theme]
  const cell = 12
  const gap = 3
  const step = cell + gap
  const left = 28
  const top = 64
  const end = addDays(today, 6 - weekday(today))
  const start = addDays(end, -(WEEKS * 7 - 1))
  const width = left + WEEKS * step + 8
  const height = top + 7 * step + 34
  const font = `font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"`
  const parts = []

  parts.push(`<text x="0" y="18" ${font} font-size="15" font-weight="600" fill="${t.text}">커밋 기록</text>`)
  parts.push(
    `<text x="0" y="40" ${font} font-size="12" fill="${t.muted}">${escape(
      `커밋 ${stats.commits} · 작업 ${stats.merges} · ${stats.first} 시작 · ${stats.days}일째`,
    )}</text>`,
  )

  let lastMonth = ''
  for (let week = 0; week < WEEKS; week++) {
    const weekStart = addDays(start, week * 7)
    const month = weekStart.slice(0, 7)
    if (month !== lastMonth && Number(weekStart.slice(8)) <= 7) {
      parts.push(`<text x="${left + week * step}" y="${top - 6}" ${font} font-size="10" fill="${t.muted}">${Number(month.slice(5))}월</text>`)
    }
    lastMonth = month
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d)
      if (day > today) continue
      const count = perDay.get(day) ?? 0
      const fill = count === 0 ? t.empty : t.levels[level(count)]
      parts.push(
        `<rect x="${left + week * step}" y="${top + d * step}" width="${cell}" height="${cell}" rx="2.5" fill="${fill}"><title>${day} 커밋 ${count}</title></rect>`,
      )
    }
  }
  for (const [d, label] of [
    [1, '월'],
    [3, '수'],
    [5, '금'],
  ]) {
    parts.push(`<text x="0" y="${top + d * step + 10}" ${font} font-size="10" fill="${t.muted}">${label}</text>`)
  }

  const legendY = top + 7 * step + 14
  const legendX = width - 8 - 4 * step - 60
  parts.push(`<text x="${legendX}" y="${legendY + 10}" ${font} font-size="10" fill="${t.muted}">적음</text>`)
  t.levels.forEach((fill, i) => parts.push(`<rect x="${legendX + 26 + i * step}" y="${legendY}" width="${cell}" height="${cell}" rx="2.5" fill="${fill}"/>`))
  parts.push(`<text x="${legendX + 26 + 4 * step + 4}" y="${legendY + 10}" ${font} font-size="10" fill="${t.muted}">많음</text>`)
  parts.push(`<text x="0" y="${legendY + 10}" ${font} font-size="10" fill="${t.muted}">${escape(`${today} 기준 · 한국 시간`)}</text>`)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(
    `커밋 기록: 커밋 ${stats.commits}, 작업 ${stats.merges}`,
  )}">\n${parts.join('\n')}\n</svg>\n`
}

const commits = await allCommits()
const perDay = new Map()
for (const commit of commits) {
  const day = dayOf(commit.commit.author.date)
  perDay.set(day, (perDay.get(day) ?? 0) + 1)
}
const today = dayOf(Date.now())
const first = [...perDay.keys()].sort()[0] ?? today
const stats = {
  commits: commits.length,
  merges: commits.filter((c) => /^Merge branch '[a-z]+\/\d{3}-/.test(c.commit.message)).length,
  first,
  days: Math.round((Date.parse(today) - Date.parse(first)) / 86_400_000) + 1,
}

for (const theme of Object.keys(THEMES)) await writeFile(SVG(theme), renderSvg(theme, perDay, today, stats))

console.log(`commits ${stats.commits}, merges ${stats.merges}, first ${first}, today ${today}`)

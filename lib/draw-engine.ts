/**
 * Draw Engine — pure functions, fully testable
 * 
 * Two draw modes:
 *   MODE 1: Random — 5 unique random integers from 1–45
 *   MODE 2: Algorithmic — weighted toward high-frequency scores across all active subscribers
 */

// ─── Helpers ───────────────────────────────────────────────────────────────

function pickRandom(pool: number[], count: number): number[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// ─── MODE 1: Random ─────────────────────────────────────────────────────────

export function generateRandomDraw(): number[] {
  const drawn: Set<number> = new Set()
  while (drawn.size < 5) {
    drawn.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(drawn).sort((a, b) => a - b)
}

// ─── MODE 2: Algorithmic ────────────────────────────────────────────────────

export function generateAlgorithmicDraw(allActiveScores: number[]): number[] {
  // Count frequency of each score value 1–45
  const freq = new Array(46).fill(0) // index 0 unused
  for (const s of allActiveScores) {
    if (s >= 1 && s <= 45) freq[s]++
  }

  // Build frequency list for values that appear at least once
  const freqValues = freq.slice(1).map((f, i) => ({ value: i + 1, freq: f })).filter(x => x.freq > 0)

  // If not enough data, fall back to random
  if (freqValues.length < 5) return generateRandomDraw()

  const med = median(freqValues.map(x => x.freq))

  const highFreq = freqValues.filter(x => x.freq >= med).map(x => x.value)
  const lowFreq = freqValues.filter(x => x.freq < med).map(x => x.value)

  const picked: Set<number> = new Set()

  // Pick 3 from high-frequency pool
  const highPicks = pickRandom(highFreq, Math.min(3, highFreq.length))
  highPicks.forEach(n => picked.add(n))

  // Pick remaining from low-frequency pool (2 ideally)
  const lowPicks = pickRandom(lowFreq, Math.min(5 - picked.size, lowFreq.length))
  lowPicks.forEach(n => picked.add(n))

  // If still need more (e.g. low pool was empty), fill from high-freq remainder
  if (picked.size < 5) {
    const remaining = highFreq.filter(n => !picked.has(n))
    const extra = pickRandom(remaining, 5 - picked.size)
    extra.forEach(n => picked.add(n))
  }

  // Last resort: random fill
  while (picked.size < 5) {
    picked.add(Math.floor(Math.random() * 45) + 1)
  }

  return Array.from(picked).sort((a, b) => a - b)
}

// ─── Match calculation ───────────────────────────────────────────────────────

export function calculateMatch(userScores: number[], drawnNumbers: number[]): {
  matchCount: number
  tierMatched: 'tier_5' | 'tier_4' | 'tier_3' | null
} {
  const drawnSet = new Set(drawnNumbers)
  const matchCount = userScores.filter(s => drawnSet.has(s)).length

  let tierMatched: 'tier_5' | 'tier_4' | 'tier_3' | null = null
  if (matchCount >= 5) tierMatched = 'tier_5'
  else if (matchCount >= 4) tierMatched = 'tier_4'
  else if (matchCount >= 3) tierMatched = 'tier_3'

  return { matchCount, tierMatched }
}

// ─── Prize pool calculation ──────────────────────────────────────────────────

export function calculatePrizePool(
  activeSubscriberCount: number,
  planMonthlyAmount: number, // in GBP (e.g. 9.99)
  poolRatio: number, // e.g. 0.70
  jackpotCarryAmount: number = 0
): {
  prizePoolTotal: number
  tier5Pool: number
  tier4Pool: number
  tier3Pool: number
} {
  const prizePoolTotal = parseFloat(
    (activeSubscriberCount * planMonthlyAmount * poolRatio + jackpotCarryAmount).toFixed(2)
  )
  const tier5Pool = parseFloat((prizePoolTotal * 0.4).toFixed(2))
  const tier4Pool = parseFloat((prizePoolTotal * 0.35).toFixed(2))
  const tier3Pool = parseFloat((prizePoolTotal * 0.25).toFixed(2))

  return { prizePoolTotal, tier5Pool, tier4Pool, tier3Pool }
}

// ─── Draw result simulation ──────────────────────────────────────────────────

export type SubscriberSnapshot = {
  userId: string
  scores: number[]
}

export type DrawResult = {
  drawnNumbers: number[]
  entries: Array<{
    userId: string
    scoresSnapshot: number[]
    matchCount: number
    tierMatched: 'tier_5' | 'tier_4' | 'tier_3' | null
  }>
  prizePoolTotal: number
  tier5Pool: number
  tier4Pool: number
  tier3Pool: number
  tier5Winners: string[]
  tier4Winners: string[]
  tier3Winners: string[]
  tier5PerWinner: number
  tier4PerWinner: number
  tier3PerWinner: number
  jackpotRollover: boolean
  jackpotRolloverAmount: number
}

export function computeDrawResult(
  drawnNumbers: number[],
  subscribers: SubscriberSnapshot[],
  poolRatio: number,
  planMonthlyAmount: number,
  jackpotCarryAmount: number = 0
): DrawResult {
  const { prizePoolTotal, tier5Pool, tier4Pool, tier3Pool } = calculatePrizePool(
    subscribers.length,
    planMonthlyAmount,
    poolRatio,
    jackpotCarryAmount
  )

  const entries = subscribers.map(sub => {
    const { matchCount, tierMatched } = calculateMatch(sub.scores, drawnNumbers)
    return {
      userId: sub.userId,
      scoresSnapshot: sub.scores,
      matchCount,
      tierMatched,
    }
  })

  const tier5Winners = entries.filter(e => e.tierMatched === 'tier_5').map(e => e.userId)
  const tier4Winners = entries.filter(e => e.tierMatched === 'tier_4').map(e => e.userId)
  const tier3Winners = entries.filter(e => e.tierMatched === 'tier_3').map(e => e.userId)

  const jackpotRollover = tier5Winners.length === 0
  const jackpotRolloverAmount = jackpotRollover ? tier5Pool : 0

  const tier5PerWinner = tier5Winners.length > 0
    ? parseFloat((tier5Pool / tier5Winners.length).toFixed(2))
    : 0
  const tier4PerWinner = tier4Winners.length > 0
    ? parseFloat((tier4Pool / tier4Winners.length).toFixed(2))
    : 0
  const tier3PerWinner = tier3Winners.length > 0
    ? parseFloat((tier3Pool / tier3Winners.length).toFixed(2))
    : 0

  return {
    drawnNumbers,
    entries,
    prizePoolTotal,
    tier5Pool,
    tier4Pool,
    tier3Pool,
    tier5Winners,
    tier4Winners,
    tier3Winners,
    tier5PerWinner,
    tier4PerWinner,
    tier3PerWinner,
    jackpotRollover,
    jackpotRolloverAmount,
  }
}

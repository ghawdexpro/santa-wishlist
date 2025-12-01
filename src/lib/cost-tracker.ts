/**
 * Cost tracking utility for AI service usage
 * Tracks estimated costs per order for business intelligence
 */

export interface CostBreakdown {
  veo: number
  heygen: number
  nanobanana: number
  gemini: number
  total: number
  childCount: number
  generatedAt: string
}

// Estimated costs per service call (USD)
const COSTS = {
  // Veo video generation (~$0.30 per 8-second video)
  veo_video: 0.30,

  // HeyGen talking avatar (~$0.50-1.00 per video)
  heygen_video: 0.75,

  // NanoBanana image generation (~$0.05 per image)
  nanobanana_image: 0.05,

  // Gemini script generation (~$0.02 per script)
  gemini_script: 0.02,
}

/**
 * Calculate estimated cost breakdown for an order
 *
 * Cost structure per child:
 * - Scene 4: 2 NanoBanana (keyframes) + 1 Veo
 * - Scene 5: 2 NanoBanana (keyframes) + 1 Veo
 * - Scene 6: 1 HeyGen OR 1 Veo (fallback)
 * - Scene 8: 2 NanoBanana (keyframes) + 1 Veo
 *
 * Shared costs:
 * - 1 Gemini script
 * - Pre-made scenes (already generated, not counted)
 */
export function calculateOrderCost(
  childCount: number,
  useHeygenForScene6: boolean = true
): CostBreakdown {
  // Per-child costs
  const perChildVeo = 3 // Scenes 4, 5, 8 (Scene 6 may be HeyGen)
  const perChildNanobanana = 6 // 2 keyframes per scene (4, 5, 8)
  const perChildHeygen = useHeygenForScene6 ? 1 : 0
  const perChildVeoScene6 = useHeygenForScene6 ? 0 : 1

  // Calculate totals
  const totalVeo = (perChildVeo + perChildVeoScene6) * childCount
  const totalHeygen = perChildHeygen * childCount
  const totalNanobanana = perChildNanobanana * childCount
  const totalGemini = 1 // One script per order

  // Calculate costs
  const veoCost = totalVeo * COSTS.veo_video
  const heygenCost = totalHeygen * COSTS.heygen_video
  const nanobananaCost = totalNanobanana * COSTS.nanobanana_image
  const geminiCost = totalGemini * COSTS.gemini_script

  const total = veoCost + heygenCost + nanobananaCost + geminiCost

  return {
    veo: Math.round(veoCost * 100) / 100,
    heygen: Math.round(heygenCost * 100) / 100,
    nanobanana: Math.round(nanobananaCost * 100) / 100,
    gemini: Math.round(geminiCost * 100) / 100,
    total: Math.round(total * 100) / 100,
    childCount,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Get cost summary for display
 */
export function formatCostSummary(breakdown: CostBreakdown): string {
  return `Total: $${breakdown.total.toFixed(2)} (Veo: $${breakdown.veo.toFixed(2)}, HeyGen: $${breakdown.heygen.toFixed(2)}, NanoBanana: $${breakdown.nanobanana.toFixed(2)}, Gemini: $${breakdown.gemini.toFixed(2)})`
}

/**
 * Calculate profit margin for an order
 */
export function calculateProfit(
  revenue: number,
  breakdown: CostBreakdown
): { profit: number; margin: number } {
  const profit = revenue - breakdown.total
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  return {
    profit: Math.round(profit * 100) / 100,
    margin: Math.round(margin * 10) / 10,
  }
}

import { AIInsightData, CitizenReport, SimulationMetrics } from '../types';

export function generateLocalRuleBasedInsights(
  metrics: SimulationMetrics,
  reports: CitizenReport[]
): AIInsightData {
  const imp = metrics.improvementPercent;
  const isHeavy = metrics.densityLabel === 'Heavy';
  const incident = metrics.activeIncident;
  const adaptiveWait = metrics.adaptive.avgWait.toFixed(1);
  const fixedWait = metrics.fixed.avgWait.toFixed(1);
  const queueA = metrics.adaptive.queueA.length;
  const queueB = metrics.adaptive.queueB.length;

  let summary = `Adaptive control demonstrates a ${imp > 0 ? imp : 0}% delay reduction under current ${metrics.densityLabel.toLowerCase()} volume (${metrics.timeOfDayString}). Average commuter waiting time reduced from ${fixedWait}s to ${adaptiveWait}s.`;
  let diagnostics = `Phase A (North-South: ${queueA} queued) and Phase B (East-West: ${queueB} queued) are actively balanced. Dynamic extension prevents starvation while clearing surges before queue spillback occurs.`;
  
  if (incident) {
    const incPhase = incident.phase === 'phaseA' ? 'North-South' : 'East-West';
    diagnostics = `Active artificial incident detected on ${incPhase} corridor (${incident.secondsRemaining}s remaining). Adaptive algorithm has temporarily allocated maximum green extension to flush bottleneck.`;
  }

  const recommendations = [
    queueA > queueB * 1.5
      ? 'Increase Phase A base green allocation by 4s to absorb persistent North-South morning corridor demand.'
      : 'Maintain dynamic queue proportional split with 15s base green to preserve cycle agility.',
    isHeavy
      ? 'Enforce 60s max wait starvation cap to protect cross-street pedestrian and minor approach delays.'
      : 'Enable early yellow termination when active queue drops to zero to prevent empty-phase idle penalty.',
    reports.length > 0
      ? `Review ${reports.length} citizen incident report(s) targeting ${reports[0].direction} approach for localized mitigation.`
      : 'No citizen incident alerts logged. Continue autonomous sensor simulation baseline.',
  ];

  const fuelSavedGallons = (
    (metrics.fixed.totalWaitTime - metrics.adaptive.totalWaitTime) *
    0.00018
  ).toFixed(2);
  const co2SavedKg = (
    parseFloat(fuelSavedGallons) * 8.887
  ).toFixed(2);

  const environmentalImpact = `Estimated ${fuelSavedGallons} gallons of idling fuel saved and ~${co2SavedKg} kg CO2 emissions prevented across simulated vehicles today.`;
  const recommendedAction = isHeavy
    ? 'Maintain Adaptive Priority Mode with 35s max green ceiling'
    : 'Dynamic Autonomous Sensing (Optimal)';

  return {
    summary,
    diagnostics,
    recommendations,
    environmentalImpact,
    recommendedAction,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source: 'Local Rule-Based Diagnostics Engine',
  };
}

export async function fetchAIInsights(
  metrics: SimulationMetrics,
  reports: CitizenReport[]
): Promise<AIInsightData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        metrics: {
          timeOfDayString: metrics.timeOfDayString,
          improvementPercent: metrics.improvementPercent,
          phaseAQueue: metrics.adaptive.queueA.length,
          phaseBQueue: metrics.adaptive.queueB.length,
          fixed: {
            avgWait: metrics.fixed.avgWait,
            maxQueue: metrics.fixed.maxQueue,
            totalProcessed: metrics.fixed.totalProcessed,
          },
          adaptive: {
            avgWait: metrics.adaptive.avgWait,
            maxQueue: metrics.adaptive.maxQueue,
            totalProcessed: metrics.adaptive.totalProcessed,
          },
        },
        reports: reports.slice(0, 5),
        activePhase: metrics.adaptive.currentPhase === 'phaseA' ? 'Phase A (North-South)' : 'Phase B (East-West)',
        speed: 1,
        rushMultiplier: metrics.rushMultiplier,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return {
        summary: json.data.summary || 'Adaptive traffic cycle successfully optimized for current arterial demand.',
        diagnostics: json.data.diagnostics || 'Phase imbalance mitigated via proportional green extension.',
        recommendations: json.data.recommendations || [
          'Maintain dynamic phase extension ceiling.',
          'Review crosswalk actuation intervals.',
        ],
        environmentalImpact: json.data.environmentalImpact || 'Significant reduction in vehicle idle exhaust emissions.',
        recommendedAction: json.data.recommendedAction || 'Autonomous Dynamic Mode',
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'Gemini 3.8 Flash',
      };
    }

    // Fallback if success: false
    return generateLocalRuleBasedInsights(metrics, reports);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('AI Insights fetch failed, switching to local rule-based analyzer:', err);
    return generateLocalRuleBasedInsights(metrics, reports);
  }
}

// TBCLM Scoring Engine
// HireTX National Employability Readiness System

export interface TBCLMScores {
  T: number; B: number; C: number; L: number; M: number;
}

export interface TBCLMWeights {
  T: number; B: number; C: number; L: number; M: number;
}

export const DEFAULT_WEIGHTS: TBCLMWeights = { T: 0.30, B: 0.25, C: 0.20, L: 0.15, M: 0.10 };

export type ReadinessLevel =
  | 'Ready for Immediate Employment'
  | 'Professionally Prepared'
  | 'Developing Professional'
  | 'Needs Structured Development';

export interface HireTXResult {
  hireTXIndex: number;
  readinessLevel: ReadinessLevel;
  tbclmBreakdown: TBCLMScores;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  axisDetails: AxisDetail[];
}

export interface AxisDetail {
  axis: keyof TBCLMScores;
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  level: string;
  description: string;
}

const AXIS_NAMES: Record<keyof TBCLMScores, string> = {
  T: 'Technical Competency',
  B: 'Behavioral Skills',
  C: 'Cognitive & Analytical Ability',
  L: 'Leadership & Professionalism',
  M: 'Market Readiness'
};

const AXIS_DESCRIPTIONS: Record<keyof TBCLMScores, string> = {
  T: 'Core technical knowledge, domain expertise, and practical application of specialized skills',
  B: 'Interpersonal effectiveness, communication, teamwork, and professional conduct',
  C: 'Critical thinking, problem-solving, decision-making, and data interpretation',
  L: 'Leadership presence, professional maturity, accountability, and strategic thinking',
  M: 'Industry awareness, market trends knowledge, and employment readiness signals'
};

export function calculateHireTXIndex(scores: TBCLMScores, weights: TBCLMWeights = DEFAULT_WEIGHTS): number {
  const index = (scores.T * weights.T) + (scores.B * weights.B) + (scores.C * weights.C) + (scores.L * weights.L) + (scores.M * weights.M);
  return Math.round(index * 100) / 100;
}

export function classifyReadinessLevel(index: number): ReadinessLevel {
  if (index >= 90) return 'Ready for Immediate Employment';
  if (index >= 75) return 'Professionally Prepared';
  if (index >= 60) return 'Developing Professional';
  return 'Needs Structured Development';
}

export function getAxisLevel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Proficient';
  if (score >= 55) return 'Developing';
  if (score >= 40) return 'Basic';
  return 'Below Standard';
}

export function generateStrengths(scores: TBCLMScores): string[] {
  const strengths: string[] = [];
  const entries = Object.entries(scores) as [keyof TBCLMScores, number][];
  entries.filter(([, s]) => s >= 75).sort(([, a], [, b]) => b - a).forEach(([axis, score]) => {
    if (axis === 'T') strengths.push(`Strong technical competency (${score.toFixed(1)}/100) — demonstrates domain expertise and applied skill`);
    if (axis === 'B') strengths.push(`Excellent behavioral skills (${score.toFixed(1)}/100) — effective communication and professional conduct`);
    if (axis === 'C') strengths.push(`High cognitive ability (${score.toFixed(1)}/100) — strong analytical and critical thinking capacity`);
    if (axis === 'L') strengths.push(`Strong leadership presence (${score.toFixed(1)}/100) — professional maturity and accountability demonstrated`);
    if (axis === 'M') strengths.push(`Market awareness (${score.toFixed(1)}/100) — strong understanding of industry landscape`);
  });
  if (strengths.length === 0) {
    strengths.push('Demonstrates foundational knowledge across simulation tasks');
    strengths.push('Shows willingness to engage with complex professional scenarios');
  }
  return strengths;
}

export function generateWeaknesses(scores: TBCLMScores): string[] {
  const weaknesses: string[] = [];
  const entries = Object.entries(scores) as [keyof TBCLMScores, number][];
  entries.filter(([, s]) => s < 65).sort(([, a], [, b]) => a - b).forEach(([axis, score]) => {
    if (axis === 'T') weaknesses.push(`Technical competency needs strengthening (${score.toFixed(1)}/100) — domain knowledge gaps identified`);
    if (axis === 'B') weaknesses.push(`Behavioral skills require development (${score.toFixed(1)}/100) — professional communication effectiveness below standard`);
    if (axis === 'C') weaknesses.push(`Analytical depth needs improvement (${score.toFixed(1)}/100) — structured problem-solving approach required`);
    if (axis === 'L') weaknesses.push(`Leadership development needed (${score.toFixed(1)}/100) — strategic thinking and accountability to be strengthened`);
    if (axis === 'M') weaknesses.push(`Market awareness gap (${score.toFixed(1)}/100) — industry knowledge and trend awareness requires attention`);
  });
  return weaknesses;
}

export function generateRecommendations(scores: TBCLMScores, specialization: string): string[] {
  const recs: string[] = [];
  if (scores.T < 70) {
    if (specialization === 'computer_science') {
      recs.push('Pursue technical certifications (AWS, Azure, Google Cloud, or cybersecurity certifications)');
      recs.push('Build portfolio projects demonstrating system design and architecture skills');
    } else {
      recs.push('Complete professional HR certifications (SHRM-CP, CIPD, or PHRi equivalent)');
      recs.push('Engage in practical HR analytics and HRIS platform training');
    }
  }
  if (scores.B < 70) {
    recs.push('Enroll in professional communication and interpersonal effectiveness workshops');
    recs.push('Practice structured communication frameworks (STAR, SCQA) in writing exercises');
  }
  if (scores.C < 70) {
    recs.push('Develop analytical skills through structured case study and problem-solving practice');
    recs.push('Study decision frameworks (Decision Matrix, MECE, First Principles Thinking)');
  }
  if (scores.L < 70) {
    recs.push('Seek leadership mentorship and executive shadowing opportunities');
    recs.push('Practice stakeholder management through cross-functional project involvement');
  }
  if (scores.M < 70) {
    recs.push('Engage regularly with industry publications, reports, and professional associations');
    recs.push('Attend industry conferences and networking events in your specialization field');
  }
  if (recs.length === 0) {
    recs.push('Continue building expertise through advanced and expert-level simulation challenges');
    recs.push('Consider pursuing thought leadership, mentoring roles, and professional speaking');
  }
  return recs;
}

export function buildAxisDetails(scores: TBCLMScores, weights: TBCLMWeights = DEFAULT_WEIGHTS): AxisDetail[] {
  return (Object.keys(scores) as (keyof TBCLMScores)[]).map(axis => ({
    axis,
    name: AXIS_NAMES[axis],
    score: scores[axis],
    weight: weights[axis],
    weightedScore: scores[axis] * weights[axis],
    level: getAxisLevel(scores[axis]),
    description: AXIS_DESCRIPTIONS[axis]
  }));
}

export function calculateTBCLMFromTaskScores(taskScores: { axis: keyof TBCLMScores; score: number; maxScore: number }[]): TBCLMScores {
  const axisGroups: Record<string, { total: number; count: number }> = {
    T: { total: 0, count: 0 }, B: { total: 0, count: 0 }, C: { total: 0, count: 0 }, L: { total: 0, count: 0 }, M: { total: 0, count: 0 }
  };
  taskScores.forEach(({ axis, score, maxScore }) => {
    const normalized = maxScore > 0 ? (score / maxScore) * 100 : 0;
    axisGroups[axis].total += normalized;
    axisGroups[axis].count += 1;
  });
  const result: TBCLMScores = { T: 0, B: 0, C: 0, L: 0, M: 0 };
  (Object.keys(axisGroups) as (keyof TBCLMScores)[]).forEach(axis => {
    const g = axisGroups[axis];
    result[axis] = g.count > 0 ? Math.round((g.total / g.count) * 100) / 100 : 0;
  });
  return result;
}

// AI-assisted hybrid text scoring
export function scoreTextResponse(
  response: string,
  keywordsPositive: string[],
  keywordsNegative: string[],
  maxScore: number = 100
): { score: number; confidence: number; feedback: string } {
  if (!response || response.trim().length < 10) {
    return { score: 0, confidence: 0.9, feedback: 'Response too short or empty' };
  }
  const lowerResponse = response.toLowerCase();
  const wordCount = response.split(/\s+/).length;
  let positiveHits = 0;
  let negativeHits = 0;
  keywordsPositive.forEach(kw => { if (lowerResponse.includes(kw.toLowerCase())) positiveHits++; });
  keywordsNegative.forEach(kw => { if (lowerResponse.includes(kw.toLowerCase())) negativeHits++; });
  
  const positiveRatio = keywordsPositive.length > 0 ? positiveHits / keywordsPositive.length : 0.4;
  const negativeImpact = keywordsNegative.length > 0 ? (negativeHits / keywordsNegative.length) * 0.3 : 0;
  const lengthBonus = wordCount >= 50 && wordCount <= 600 ? 0.12 : wordCount >= 20 ? 0.05 : wordCount >= 10 ? 0 : -0.15;
  const hasStructure = /\d+[).\s]|\n[-•*]|^[-•*]\s/m.test(response) ? 0.08 : 0;
  const hasSentences = response.includes('.') ? 0.05 : 0;

  let normalizedScore = Math.max(0.2, Math.min(1, positiveRatio + lengthBonus + hasStructure + hasSentences - negativeImpact));
  const finalScore = Math.round(normalizedScore * maxScore * 100) / 100;
  const confidence = (positiveHits + negativeHits) > 2 ? 0.75 : 0.55;
  const feedback = positiveHits > (keywordsPositive.length || 1) * 0.6
    ? 'Response demonstrates strong domain knowledge with relevant technical terminology'
    : positiveHits > (keywordsPositive.length || 1) * 0.3
    ? 'Response shows partial understanding. More specific terminology and depth recommended'
    : 'Response lacks domain-specific content. Review task requirements and deepen your analysis';
  
  return { score: finalScore, confidence, feedback };
}

export function computeFullHireTXResult(scores: TBCLMScores, specialization: string, weights: TBCLMWeights = DEFAULT_WEIGHTS): HireTXResult {
  const hireTXIndex = calculateHireTXIndex(scores, weights);
  const readinessLevel = classifyReadinessLevel(hireTXIndex);
  return {
    hireTXIndex,
    readinessLevel,
    tbclmBreakdown: scores,
    strengths: generateStrengths(scores),
    weaknesses: generateWeaknesses(scores),
    recommendations: generateRecommendations(scores, specialization),
    axisDetails: buildAxisDetails(scores, weights)
  };
}

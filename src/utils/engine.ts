import {
  ADAPTIVE_QUESTIONS,
  CORE_QUESTIONS,
  DAILY_MINUTES_MAP,
  DIMENSIONS,
  GENERIC_PROFESSION_VALUE,
  MODULES,
  OBJECTIVE_TO_TAGS,
  PRIORITIES,
  PROFESSION_TO_RELEVANT_TAGS,
  TAG_TO_DIMENSION_MAP,
} from '../data';
import {
  DiagnosticState,
  DimensionScore,
  ModuleItem,
  ModuleProgressItem,
  Question,
  RecommendationResult,
  UserProfile,
  UserPriorities,
  WeeklySchedulePlan,
} from '../types';

/**
 * Prepares the 24 questions for the diagnostic:
 * 16 fixed core questions + 8 adaptive questions
 * (one per selected priority in rank order, filled with remaining from bank to guarantee exactly 24).
 */
export function prepareDiagnosticQuestions(priorities: UserPriorities): Question[] {
  const core = [...CORE_QUESTIONS]; // 16 questions
  const adaptivePool = [...ADAPTIVE_QUESTIONS]; // 20 questions

  const selectedAdaptive: Question[] = [];
  const usedAdaptiveIds = new Set<string>();

  // Collect priorities in rank order: rank 1, rank 2, rank 3, then remaining unranked selected
  const orderedPriorityIds: string[] = [];
  priorities.ranked.forEach((pId) => {
    if (pId && !orderedPriorityIds.includes(pId)) {
      orderedPriorityIds.push(pId);
    }
  });
  priorities.selected.forEach((pId) => {
    if (pId && !orderedPriorityIds.includes(pId)) {
      orderedPriorityIds.push(pId);
    }
  });

  // Pick matching adaptive questions for ordered priorities
  for (const pId of orderedPriorityIds) {
    if (selectedAdaptive.length >= 8) break;
    const match = adaptivePool.find((q) => q.priorityId === pId && !usedAdaptiveIds.has(q.id));
    if (match) {
      selectedAdaptive.push(match);
      usedAdaptiveIds.add(match.id);
    }
  }

  // If fewer than 8 questions selected, fill remainder from unused bank questions
  for (const q of adaptivePool) {
    if (selectedAdaptive.length >= 8) break;
    if (!usedAdaptiveIds.has(q.id)) {
      selectedAdaptive.push(q);
      usedAdaptiveIds.add(q.id);
    }
  }

  return [...core, ...selectedAdaptive];
}

export function getAllQuestionsMap(): Map<string, Question> {
  const map = new Map<string, Question>();
  CORE_QUESTIONS.forEach((q) => map.set(q.id, q));
  ADAPTIVE_QUESTIONS.forEach((q) => map.set(q.id, q));
  return map;
}

/**
 * Computes scores per dimension:
 * Only questions actually administered to this learner are evaluated.
 * Dimensions with 0 administered questions return percentage = null ("not assessed", never 0%).
 */
export function computeDimensionScores(diagnostic: DiagnosticState): DimensionScore[] {
  const questionsMap = getAllQuestionsMap();

  return DIMENSIONS.map((dim) => {
    const administeredInDim = diagnostic.administered
      .map((id) => questionsMap.get(id))
      .filter((q): q is Question => Boolean(q && q.dimensionId === dim.id));

    if (administeredInDim.length === 0) {
      return {
        id: dim.id,
        name: dim.name,
        correct: 0,
        administered: 0,
        percentage: null,
      };
    }

    let correct = 0;
    administeredInDim.forEach((q) => {
      if (diagnostic.answers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const percentage = Math.round((correct / administeredInDim.length) * 100);

    return {
      id: dim.id,
      name: dim.name,
      correct,
      administered: administeredInDim.length,
      percentage,
    };
  });
}

export function computeOverallScore(dimensionScores: DimensionScore[]): {
  overallPercentage: number | null;
  band: string;
  strengths: DimensionScore[];
  gaps: DimensionScore[];
} {
  const assessed = dimensionScores.filter((d) => d.percentage !== null);

  if (assessed.length === 0) {
    return {
      overallPercentage: null,
      band: 'Not Assessed',
      strengths: [],
      gaps: [],
    };
  }

  const sum = assessed.reduce((acc, d) => acc + (d.percentage ?? 0), 0);
  const overallPercentage = Math.round(sum / assessed.length);

  let band = 'Foundation Recommended';
  if (overallPercentage >= 85) {
    band = 'Advanced Practice Candidate';
  } else if (overallPercentage >= 65) {
    band = 'Applied Practice Recommended';
  } else if (overallPercentage >= 40) {
    band = 'Developing';
  }

  const strengths = assessed.filter((d) => (d.percentage ?? 0) >= 70);
  const gaps = assessed.filter((d) => (d.percentage ?? 0) < 50);

  return {
    overallPercentage,
    band,
    strengths,
    gaps,
  };
}

/**
 * Transparent recommendation engine formula:
 * score = 0.35*moduleRelevance + 0.30*skillGap + 0.20*professionalTask + 0.10*learnerGoal + 0.05*learnerPreference
 * Always scores ALL 24 modules.
 * Selects top 8 (floor 5, ceiling 12) + full prerequisite closure, sorted by catalog order.
 */
export function computeRecommendations(
  profile: UserProfile,
  priorities: UserPriorities,
  dimensionScores: DimensionScore[]
): RecommendationResult[] {
  // Collect all tags from selected priorities
  const selectedPriorityObjects = priorities.selected
    .map((pId) => PRIORITIES.find((p) => p.id === pId))
    .filter((p): p is (typeof PRIORITIES)[0] => Boolean(p));

  const selectedPriorityTags = new Set<string>();
  selectedPriorityObjects.forEach((p) => {
    p.tags.forEach((tag) => selectedPriorityTags.add(tag));
  });

  const dimScoreMap = new Map<string, number | null>();
  dimensionScores.forEach((d) => dimScoreMap.set(d.id, d.percentage));

  const goalTags = OBJECTIVE_TO_TAGS[profile.objective] || [];

  const scoredModules = MODULES.map((module) => {
    // 1. Module relevance: overlap(module.tags, selectedPriorityTags) / len(module.tags)
    const overlapCount = module.tags.filter((t) => selectedPriorityTags.has(t)).length;
    const moduleRelevance = module.tags.length > 0 ? overlapCount / module.tags.length : 0;

    // 2. Skill gap: avg over module.tags of (100 - dimensionScore[tagToDim[tag]]) / 100; 0.5 if not assessed
    let gapSum = 0;
    module.tags.forEach((tag) => {
      const dimId = TAG_TO_DIMENSION_MAP[tag];
      const score = dimId ? dimScoreMap.get(dimId) : null;
      if (score !== undefined && score !== null) {
        gapSum += (100 - score) / 100;
      } else {
        gapSum += 0.5; // default 0.5 when unassessed
      }
    });
    const skillGap = module.tags.length > 0 ? gapSum / module.tags.length : 0.5;

    // 3. Professional task: max priority-rank-weight among selected priorities sharing a tag with module / 5
    let maxWeight = 0;
    selectedPriorityObjects.forEach((p) => {
      const sharesTag = p.tags.some((t) => module.tags.includes(t));
      if (sharesTag) {
        let weight = 1; // selected unranked
        if (priorities.ranked[0] === p.id) weight = 5;
        else if (priorities.ranked[1] === p.id) weight = 3;
        else if (priorities.ranked[2] === p.id) weight = 2;
        if (weight > maxWeight) maxWeight = weight;
      }
    });
    const professionalTask = maxWeight / 5;

    // 4. Learner goal: 1.0 if a module tag is in objective_to_tags, else 0.3
    const hasGoalOverlap = module.tags.some((t) => goalTags.includes(t));
    const learnerGoal = hasGoalOverlap ? 1.0 : 0.3;

    // 5. Learner preference: flat 0.5
    const learnerPreference = 0.5;

    const totalScore =
      0.35 * moduleRelevance +
      0.30 * skillGap +
      0.20 * professionalTask +
      0.10 * learnerGoal +
      0.05 * learnerPreference;

    // Human-readable reasons (up to 2)
    const reasons: string[] = [];

    // Reason 1: Priority match
    const matchingPriority = selectedPriorityObjects.find((p) =>
      p.tags.some((t) => module.tags.includes(t))
    );
    if (matchingPriority) {
      reasons.push(`Directly advances your priority: ${matchingPriority.name}`);
    }

    // Reason 2: Dimension gap
    for (const tag of module.tags) {
      const dimId = TAG_TO_DIMENSION_MAP[tag];
      const score = dimId ? dimScoreMap.get(dimId) : null;
      if (score !== null && score !== undefined && score < 65) {
        const dimName = DIMENSIONS.find((d) => d.id === dimId)?.name || 'core skill';
        reasons.push(`Strengthens ${dimName} where a skill gap was assessed (${score}%)`);
        break;
      }
    }

    if (reasons.length === 0) {
      if (module.prereq.length === 0) {
        reasons.push('Foundational module providing essential baseline concepts');
      } else {
        reasons.push('Rounds out your targeted pathway with complementary applied techniques');
      }
    }

    return {
      module,
      score: totalScore,
      reasons: reasons.slice(0, 2),
    };
  });

  // Sort descending by score
  scoredModules.sort((a, b) => b.score - a.score);

  // Take top 8 (floor 5, ceiling 12; default top 8)
  const selectedTop = scoredModules.slice(0, 8);
  const selectedIds = new Set<string>(selectedTop.map((s) => s.module.id));

  // Expand with full prerequisite closure
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(selectedIds)) {
      const mod = MODULES.find((m) => m.id === id);
      if (mod && mod.prereq) {
        for (const preId of mod.prereq) {
          if (!selectedIds.has(preId)) {
            selectedIds.add(preId);
            changed = true;
          }
        }
      }
    }
  }

  // Build final recommendation list sorted in catalog order
  const resultMap = new Map<string, RecommendationResult>();
  scoredModules.forEach((sm) => resultMap.set(sm.module.id, sm));

  const finalResults: RecommendationResult[] = [];
  MODULES.forEach((mod) => {
    if (selectedIds.has(mod.id)) {
      const existing = resultMap.get(mod.id);
      const isPrereqAddon = !selectedTop.some((s) => s.module.id === mod.id);
      if (existing) {
        finalResults.push({
          ...existing,
          isPrerequisiteAddon: isPrereqAddon,
          reasons: isPrereqAddon
            ? ['Essential prerequisite to unlock advanced modules in your pathway', ...existing.reasons]
            : existing.reasons,
        });
      }
    }
  });

  return finalResults;
}

/**
 * Filter algorithm for library grid:
 * 1. If libraryShowAll OR profession == generic_profession_value -> show all modules.
 * 2. allowedTags = tags(profession_to_relevant_tags[profession]) UNION tags of every selected priority.
 * 3. If allowedTags is empty -> show all modules.
 * 4. base = modules where level=='Foundation' OR already has progress OR any module.tag is in allowedTags.
 * 5. Expand base with full prerequisite closure.
 * 6. Render only that set, in catalog order.
 */
export function filterLibraryModules(
  profile: UserProfile,
  priorities: UserPriorities,
  moduleProgress: Record<string, ModuleProgressItem>,
  libraryShowAll: boolean
): ModuleItem[] {
  if (libraryShowAll || profile.profession === GENERIC_PROFESSION_VALUE) {
    return MODULES;
  }

  const professionTags = PROFESSION_TO_RELEVANT_TAGS[profile.profession] || [];
  const priorityTags: string[] = [];
  priorities.selected.forEach((pId) => {
    const p = PRIORITIES.find((item) => item.id === pId);
    if (p) priorityTags.push(...p.tags);
  });

  const allowedTags = new Set<string>([...professionTags, ...priorityTags]);

  if (allowedTags.size === 0) {
    return MODULES;
  }

  const baseIds = new Set<string>();

  MODULES.forEach((m) => {
    const hasProgress = moduleProgress[m.id] && moduleProgress[m.id].status !== 'not_started';
    const isFoundation = m.level === 'Foundation';
    const tagMatches = m.tags.some((t) => allowedTags.has(t));

    if (isFoundation || hasProgress || tagMatches) {
      baseIds.add(m.id);
    }
  });

  // Prerequisite closure
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(baseIds)) {
      const mod = MODULES.find((m) => m.id === id);
      if (mod && mod.prereq) {
        for (const p of mod.prereq) {
          if (!baseIds.has(p)) {
            baseIds.add(p);
            changed = true;
          }
        }
      }
    }
  }

  return MODULES.filter((m) => baseIds.has(m.id));
}

/**
 * Weekly schedule plan calculation:
 * daily_minutes: { '15 minutes daily': 15, '30 minutes daily': 30, '1 hour daily': 60, '2 hours daily': 120, 'Weekends only': 90, 'Custom schedule': 30 }
 * sessions_per_week: 2 if Weekends only else 7
 * weeks: ceil(totalPathwayHours*60 / max(dailyMinutes*sessionsPerWeek, 15))
 * weekly_table: accumulate modules into a week until weekly hour budget is filled, cap at 52 weeks
 */
export function calculateSchedule(
  pathwayModules: ModuleItem[],
  timeAvailableStr: string
): WeeklySchedulePlan {
  const dailyMinutes = DAILY_MINUTES_MAP[timeAvailableStr] || 30;
  const sessionsPerWeek = timeAvailableStr === 'Weekends only' ? 2 : 7;
  const totalHours = pathwayModules.reduce((acc, m) => acc + m.hours, 0);

  const weeklyMinutes = Math.max(dailyMinutes * sessionsPerWeek, 15);
  const weeklyHoursBudget = weeklyMinutes / 60;
  const totalWeeks = Math.max(1, Math.ceil((totalHours * 60) / weeklyMinutes));

  const weeks: {
    weekNumber: number;
    hours: number;
    modules: ModuleItem[];
  }[] = [];

  let currentWeekNum = 1;
  let currentWeekHours = 0;
  let currentWeekModules: ModuleItem[] = [];

  pathwayModules.forEach((mod) => {
    if (currentWeekHours + mod.hours > weeklyHoursBudget && currentWeekModules.length > 0 && currentWeekNum < 52) {
      weeks.push({
        weekNumber: currentWeekNum,
        hours: currentWeekHours,
        modules: currentWeekModules,
      });
      currentWeekNum++;
      currentWeekHours = mod.hours;
      currentWeekModules = [mod];
    } else {
      currentWeekHours += mod.hours;
      currentWeekModules.push(mod);
    }
  });

  if (currentWeekModules.length > 0) {
    weeks.push({
      weekNumber: currentWeekNum,
      hours: currentWeekHours,
      modules: currentWeekModules,
    });
  }

  return {
    totalHours,
    dailyMinutes,
    sessionsPerWeek,
    totalWeeks: Math.max(totalWeeks, weeks.length),
    weeks,
  };
}

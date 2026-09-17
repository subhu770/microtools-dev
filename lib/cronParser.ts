/**
 * Pure Client-Side 5-Part Cron Parser & Schedule Calculator
 * Zero backend dependencies.
 */

export interface CronFieldInfo {
  name: string;
  raw: string;
  description: string;
  allowedRange: string;
  matchingValues: number[];
}

export interface NextExecution {
  date: Date;
  utcString: string;
  localString: string;
  relativeCountdown: string;
  msFromNow: number;
}

export interface CronParseResult {
  isValid: boolean;
  expression: string;
  error?: string;
  errorField?: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'general';
  humanDescription: string;
  fields: {
    minute: CronFieldInfo;
    hour: CronFieldInfo;
    dayOfMonth: CronFieldInfo;
    month: CronFieldInfo;
    dayOfWeek: CronFieldInfo;
  };
  nextExecutions: NextExecution[];
}

const MONTH_NAMES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const DAY_NAMES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

const MONTH_LABEL = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_LABEL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

/**
 * Parses a 5-part cron expression and returns validity, breakdown, human explanation,
 * and next execution timestamps.
 */
export function parseCron(expression: string, fromDate: Date = new Date(), maxExecutions = 5): CronParseResult {
  const trimmed = expression.trim();
  const parts = trimmed.split(/\s+/);

  const defaultFields: CronParseResult['fields'] = {
    minute: { name: 'Minute', raw: '', description: '', allowedRange: '0 - 59', matchingValues: [] },
    hour: { name: 'Hour', raw: '', description: '', allowedRange: '0 - 23', matchingValues: [] },
    dayOfMonth: { name: 'Day of Month', raw: '', description: '', allowedRange: '1 - 31', matchingValues: [] },
    month: { name: 'Month', raw: '', description: '', allowedRange: '1 - 12 or JAN-DEC', matchingValues: [] },
    dayOfWeek: { name: 'Day of Week', raw: '', description: '', allowedRange: '0 - 7 (0 & 7 = Sun) or SUN-SAT', matchingValues: [] },
  };

  if (!trimmed) {
    return {
      isValid: false,
      expression: trimmed,
      error: 'Cron expression cannot be empty.',
      errorField: 'general',
      humanDescription: 'Please enter a 5-part cron expression.',
      fields: defaultFields,
      nextExecutions: [],
    };
  }

  if (parts.length !== 5) {
    return {
      isValid: false,
      expression: trimmed,
      error: `Expected 5 fields (minute hour day month day-of-week), but found ${parts.length}.`,
      errorField: 'general',
      humanDescription: 'Invalid cron format: must contain exactly 5 space-separated parts.',
      fields: defaultFields,
      nextExecutions: [],
    };
  }

  const [rawMin, rawHour, rawDom, rawMonth, rawDow] = parts;

  // 1. Parse Minute (0 - 59)
  const minResult = parseFieldPart(rawMin, 0, 59, {});
  if (minResult.error) {
    return createErrorResult(trimmed, `Minute field error: ${minResult.error}`, 'minute', defaultFields);
  }

  // 2. Parse Hour (0 - 23)
  const hourResult = parseFieldPart(rawHour, 0, 23, {});
  if (hourResult.error) {
    return createErrorResult(trimmed, `Hour field error: ${hourResult.error}`, 'hour', defaultFields);
  }

  // 3. Parse Day of Month (1 - 31)
  const domResult = parseFieldPart(rawDom, 1, 31, {});
  if (domResult.error) {
    return createErrorResult(trimmed, `Day of Month field error: ${domResult.error}`, 'dayOfMonth', defaultFields);
  }

  // 4. Parse Month (1 - 12, JAN - DEC)
  const monthResult = parseFieldPart(rawMonth, 1, 12, MONTH_NAMES);
  if (monthResult.error) {
    return createErrorResult(trimmed, `Month field error: ${monthResult.error}`, 'month', defaultFields);
  }

  // 5. Parse Day of Week (0 - 7, SUN - SAT)
  const dowResult = parseFieldPart(rawDow, 0, 7, DAY_NAMES);
  if (dowResult.error) {
    return createErrorResult(trimmed, `Day of Week field error: ${dowResult.error}`, 'dayOfWeek', defaultFields);
  }

  // Normalize DOW 7 to 0 (both Sunday)
  const normalizedDow = Array.from(new Set(dowResult.values.map(v => (v === 7 ? 0 : v)))).sort((a, b) => a - b);

  const fields: CronParseResult['fields'] = {
    minute: {
      name: 'Minute',
      raw: rawMin,
      description: describeMinuteField(rawMin, minResult.values),
      allowedRange: '0 - 59',
      matchingValues: minResult.values,
    },
    hour: {
      name: 'Hour',
      raw: rawHour,
      description: describeHourField(rawHour, hourResult.values),
      allowedRange: '0 - 23',
      matchingValues: hourResult.values,
    },
    dayOfMonth: {
      name: 'Day of Month',
      raw: rawDom,
      description: describeDomField(rawDom, domResult.values),
      allowedRange: '1 - 31',
      matchingValues: domResult.values,
    },
    month: {
      name: 'Month',
      raw: rawMonth,
      description: describeMonthField(rawMonth, monthResult.values),
      allowedRange: '1 - 12 or JAN-DEC',
      matchingValues: monthResult.values,
    },
    dayOfWeek: {
      name: 'Day of Week',
      raw: rawDow,
      description: describeDowField(rawDow, normalizedDow),
      allowedRange: '0 - 7 (SUN - SAT)',
      matchingValues: normalizedDow,
    },
  };

  // Generate complete human explanation
  const humanDescription = generateHumanDescription(parts, fields);

  // Compute Next Executions
  const nextExecutions = calculateNextRuns(
    minResult.values,
    hourResult.values,
    domResult.values,
    monthResult.values,
    normalizedDow,
    rawDom === '*',
    rawDow === '*',
    fromDate,
    maxExecutions
  );

  return {
    isValid: true,
    expression: trimmed,
    humanDescription,
    fields,
    nextExecutions,
  };
}

function createErrorResult(
  expression: string,
  error: string,
  field: CronParseResult['errorField'],
  fields: CronParseResult['fields']
): CronParseResult {
  return {
    isValid: false,
    expression,
    error,
    errorField: field,
    humanDescription: `Invalid expression: ${error}`,
    fields,
    nextExecutions: [],
  };
}

/**
 * Parses an individual field (e.g. "*", "5", "1-5", "star/15", "1,3,5", "9-17/2").
 */
function parseFieldPart(
  part: string,
  min: number,
  max: number,
  aliasMap: Record<string, number>
): { values: number[]; error?: string } {
  const clean = part.toUpperCase();
  const valuesSet = new Set<number>();

  const listItems = clean.split(',');

  for (const item of listItems) {
    if (!item) {
      return { values: [], error: 'Empty item in list.' };
    }

    // Step check: e.g., */15 or 10-30/5 or 0/10
    if (item.includes('/')) {
      const [rangePart, stepStr] = item.split('/');
      const step = parseInt(stepStr, 10);

      if (isNaN(step) || step <= 0) {
        return { values: [], error: `Invalid step value "/${stepStr}". Must be a positive integer.` };
      }

      let start = min;
      let end = max;

      if (rangePart && rangePart !== '*') {
        if (rangePart.includes('-')) {
          const [sStr, eStr] = rangePart.split('-');
          const s = resolveValue(sStr, min, max, aliasMap);
          const e = resolveValue(eStr, min, max, aliasMap);
          if (s === null || e === null) return { values: [], error: `Invalid range in step: "${rangePart}".` };
          if (s > e) return { values: [], error: `Start value (${s}) cannot be greater than end (${e}).` };
          start = s;
          end = e;
        } else {
          const s = resolveValue(rangePart, min, max, aliasMap);
          if (s === null) return { values: [], error: `Invalid start value in step: "${rangePart}".` };
          start = s;
        }
      }

      for (let i = start; i <= end; i += step) {
        valuesSet.add(i);
      }
      continue;
    }

    // Wildcard *
    if (item === '*') {
      for (let i = min; i <= max; i++) {
        valuesSet.add(i);
      }
      continue;
    }

    // Range: e.g. 1-5 or MON-FRI
    if (item.includes('-')) {
      const [sStr, eStr] = item.split('-');
      const s = resolveValue(sStr, min, max, aliasMap);
      const e = resolveValue(eStr, min, max, aliasMap);

      if (s === null || e === null) {
        return { values: [], error: `Invalid range "${item}". Values must be between ${min} and ${max}.` };
      }
      if (s > e) {
        return { values: [], error: `Range start (${s}) cannot be greater than end (${e}) in "${item}".` };
      }

      for (let i = s; i <= e; i++) {
        valuesSet.add(i);
      }
      continue;
    }

    // Single value or alias
    const val = resolveValue(item, min, max, aliasMap);
    if (val === null) {
      return { values: [], error: `Invalid value "${item}". Expected value between ${min} and ${max}.` };
    }
    valuesSet.add(val);
  }

  const values = Array.from(valuesSet).sort((a, b) => a - b);
  if (values.length === 0) {
    return { values: [], error: `No valid values found in "${part}".` };
  }

  return { values };
}

function resolveValue(
  token: string,
  min: number,
  max: number,
  aliasMap: Record<string, number>
): number | null {
  const t = token.trim().toUpperCase();
  if (aliasMap[t] !== undefined) {
    return aliasMap[t];
  }
  const num = parseInt(t, 10);
  if (!isNaN(num) && num >= min && num <= max) {
    return num;
  }
  return null;
}

/**
 * Natural language field descriptions
 */
function describeMinuteField(raw: string, vals: number[]): string {
  if (raw === '*') return 'Every minute';
  if (raw.startsWith('*/')) return `Every ${raw.slice(2)} minutes`;
  if (vals.length === 1) return `At minute ${pad(vals[0])}`;
  return `At minutes: ${vals.map(pad).join(', ')}`;
}

function describeHourField(raw: string, vals: number[]): string {
  if (raw === '*') return 'Every hour';
  if (raw.startsWith('*/')) return `Every ${raw.slice(2)} hours`;
  if (raw.includes('-') && !raw.includes(',')) {
    const [s, e] = raw.split('-');
    return `Every hour between ${format12h(parseInt(s, 10))} and ${format12h(parseInt(e, 10))}`;
  }
  if (vals.length === 1) return `At ${format12h(vals[0])}`;
  return `At hours: ${vals.map(format12h).join(', ')}`;
}

function describeDomField(raw: string, vals: number[]): string {
  if (raw === '*') return 'Every day of the month';
  if (raw.startsWith('*/')) return `Every ${raw.slice(2)} days`;
  if (vals.length === 1) return `On day ${vals[0]} of the month`;
  return `On days: ${vals.join(', ')} of the month`;
}

function describeMonthField(raw: string, vals: number[]): string {
  if (raw === '*') return 'Every month';
  if (raw.startsWith('*/')) return `Every ${raw.slice(2)} months`;
  if (vals.length === 1) return `Only in ${MONTH_LABEL[vals[0]]}`;
  return `In ${vals.map(v => MONTH_LABEL[v]).join(', ')}`;
}

function describeDowField(raw: string, vals: number[]): string {
  if (raw === '*') return 'Every day of the week';
  if (raw === '1-5') return 'Monday through Friday (weekdays)';
  if (raw === '0,6' || raw === '6,0' || raw === '6-7') return 'Saturday and Sunday (weekends)';
  if (vals.length === 1) return `Only on ${DAY_LABEL[vals[0]]}`;
  return `On ${vals.map(v => DAY_LABEL[v]).join(', ')}`;
}

/**
 * Generate full fluent sentence.
 */
function generateHumanDescription(parts: string[], fields: CronParseResult['fields']): string {
  const [min, hour, dom, month, dow] = parts;

  // Case 1: Every X minutes
  if (min.startsWith('*/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return `Runs every ${min.slice(2)} minutes, every day.`;
  }

  // Case 2: Every minute
  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Runs every minute, 24/7.';
  }

  // Case 3: Every hour at minute X
  if (!min.includes('*') && !min.includes('/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return `Runs every hour at minute ${pad(parseInt(min, 10))}.`;
  }

  // Case 4: Daily at specific time
  if (!min.includes('*') && !hour.includes('*') && !hour.includes('/') && dom === '*' && month === '*' && dow === '*') {
    return `Runs daily at ${formatTime(parseInt(hour, 10), parseInt(min, 10))}.`;
  }

  // Case 5: Weekdays at specific hour
  if (!min.includes('*') && !hour.includes('*') && dom === '*' && month === '*' && dow === '1-5') {
    return `Runs at ${formatTime(parseInt(hour, 10), parseInt(min, 10))}, Monday through Friday.`;
  }

  // Case 6: Hourly during business hours
  if (!min.includes('*') && hour === '9-17' && dom === '*' && month === '*' && dow === '1-5') {
    return `Runs at ${formatTime(0, parseInt(min, 10))} past the hour, from 09:00 to 17:00, Monday through Friday.`;
  }

  // Default composite description
  const timeDesc = `${fields.minute.description}, ${fields.hour.description}`;
  const dayDesc = dom !== '*' ? fields.dayOfMonth.description : '';
  const monthDesc = month !== '*' ? fields.month.description : '';
  const dowDesc = dow !== '*' ? fields.dayOfWeek.description : '';

  const clauses = [timeDesc, dayDesc, monthDesc, dowDesc].filter(Boolean);
  return clauses.join(', ') + '.';
}

/**
 * Calculates next N executions starting from fromDate.
 */
function calculateNextRuns(
  minutes: number[],
  hours: number[],
  doms: number[],
  months: number[],
  dows: number[],
  isWildcardDom: boolean,
  isWildcardDow: boolean,
  fromDate: Date,
  maxExecutions: number
): NextExecution[] {
  const executions: NextExecution[] = [];

  // Start checking from next minute (truncate seconds and ms, add 1 minute)
  const current = new Date(fromDate.getTime());
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  // Maximum search iterations to prevent infinite loop
  let safetyLimit = 500000;

  while (executions.length < maxExecutions && safetyLimit > 0) {
    safetyLimit--;

    const cMonth = current.getMonth() + 1; // 1-12
    if (!months.includes(cMonth)) {
      // Advance to 1st of next month
      current.setMonth(current.getMonth() + 1, 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const cDom = current.getDate();
    const cDow = current.getDay(); // 0-6

    // Standard cron behavior for DOM vs DOW:
    // If both are specified (not wildcard), it matches if EITHER matches.
    // If only one is specified, that one must match.
    let dayMatches = false;
    if (isWildcardDom && isWildcardDow) {
      dayMatches = true;
    } else if (!isWildcardDom && !isWildcardDow) {
      dayMatches = doms.includes(cDom) || dows.includes(cDow);
    } else if (!isWildcardDom) {
      dayMatches = doms.includes(cDom);
    } else {
      dayMatches = dows.includes(cDow);
    }

    if (!dayMatches) {
      // Advance to next day at 00:00
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const cHour = current.getHours();
    if (!hours.includes(cHour)) {
      // Advance to next hour
      current.setHours(current.getHours() + 1, 0, 0, 0);
      continue;
    }

    const cMin = current.getMinutes();
    if (!minutes.includes(cMin)) {
      // Advance to next minute
      current.setMinutes(current.getMinutes() + 1);
      continue;
    }

    // Found match!
    const runDate = new Date(current.getTime());
    const msFromNow = runDate.getTime() - fromDate.getTime();

    executions.push({
      date: runDate,
      utcString: formatUtcDate(runDate),
      localString: formatLocalDate(runDate),
      relativeCountdown: formatCountdown(msFromNow),
      msFromNow,
    });

    // Advance 1 minute to find next
    current.setMinutes(current.getMinutes() + 1);
  }

  return executions;
}

/**
 * Format helpers
 */
function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

function format12h(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${pad(h)}:00 ${ampm} (${pad(hour)}:00)`;
}

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${pad(h)}:${pad(minute)} ${ampm} (${pad(hour)}:${pad(minute)})`;
}

export function formatUtcDate(d: Date): string {
  return d.toUTCString().replace('GMT', 'UTC');
}

export function formatLocalDate(d: Date): string {
  return new Intl.DateTimeFormat('default', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(d);
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Due now';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return `in ${parts.slice(0, 3).join(' ')}`;
}

import { parseCron } from '../cronParser';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Testing Cron Parser Engine ---');

// Test 1: Standard Presets
{
  const p1 = parseCron('*/15 * * * *');
  assert(p1.isValid, 'Expected */15 * * * * to be valid');
  assert(p1.nextExecutions.length === 5, 'Expected 5 next executions');
  assert(p1.fields.minute.matchingValues.length === 4, 'Expected 4 minute values for */15 (0, 15, 30, 45)');
  console.log('Preset 1 (Every 15 mins):', p1.humanDescription);
}

{
  const p2 = parseCron('0 0 * * *');
  assert(p2.isValid, 'Expected 0 0 * * * to be valid');
  assert(p2.fields.hour.matchingValues[0] === 0, 'Hour should be 0');
  assert(p2.fields.minute.matchingValues[0] === 0, 'Minute should be 0');
  console.log('Preset 2 (Daily midnight):', p2.humanDescription);
}

{
  const p3 = parseCron('0 9 * * 1');
  assert(p3.isValid, 'Expected 0 9 * * 1 to be valid');
  assert(p3.fields.dayOfWeek.matchingValues[0] === 1, 'Day of week should be 1 (Monday)');
  console.log('Preset 3 (Monday 9 AM):', p3.humanDescription);
}

{
  const p4 = parseCron('0 0 1 * *');
  assert(p4.isValid, 'Expected 0 0 1 * * to be valid');
  assert(p4.fields.dayOfMonth.matchingValues[0] === 1, 'DOM should be 1');
  console.log('Preset 4 (First of month):', p4.humanDescription);
}

{
  const p5 = parseCron('0 9-17 * * 1-5');
  assert(p5.isValid, 'Expected 0 9-17 * * 1-5 to be valid');
  assert(p5.fields.hour.matchingValues.length === 9, 'Expected 9 hours (9-17)');
  console.log('Preset 5 (Weekday business hours):', p5.humanDescription);
}

// Test 2: Error Handling
{
  const invalidMinutes = parseCron('65 * * * *');
  assert(!invalidMinutes.isValid, 'Expected 65 * * * * to be invalid');
  assert(invalidMinutes.errorField === 'minute', 'Expected error on minute field');
  console.log('Correctly caught minute out of range:', invalidMinutes.error);
}

{
  const invalidFields = parseCron('* * *');
  assert(!invalidFields.isValid, 'Expected 3-part cron to fail');
  console.log('Correctly caught field count error:', invalidFields.error);
}

{
  const invalidRange = parseCron('0 18-9 * * *');
  assert(!invalidRange.isValid, 'Expected inverted range 18-9 to fail');
  console.log('Correctly caught inverted range error:', invalidRange.error);
}

// Test 3: Named Values
{
  const namedCron = parseCron('0 12 * JAN-MAR MON,FRI');
  assert(namedCron.isValid, 'Expected named cron to be valid');
  assert(namedCron.fields.month.matchingValues.length === 3, 'Expected Jan, Feb, Mar (1,2,3)');
  assert(namedCron.fields.dayOfWeek.matchingValues.includes(1) && namedCron.fields.dayOfWeek.matchingValues.includes(5), 'Expected Mon & Fri');
  console.log('Named months & days test passed:', namedCron.humanDescription);
}

console.log('--- All Cron Parser Tests Passed Successfully! ---');

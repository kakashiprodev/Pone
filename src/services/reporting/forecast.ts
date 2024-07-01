/**
 * This service contains the calculations for the "actions" in a report
 * That means the user can add actions to the report that will reduce the emissions
 * Also he can add targets for the emissions
 * The service will calculate the emissions for the report
 */

import { ActionEntry, TargetEntry } from '../types';

// interface Target {
//     year: number;
//     percentage: number;
// }

// interface Action {
//     finishedUntil: string; // Format: YYYY-MM-DD
//     targetInTons: number;
//     relevant: boolean;
// }

export interface OldReportValues {
  year: number;
  value: number;
}

export interface EmissionValue {
  realReportValue: null | number; // real value for this time period. null if no value exists
  refValue: number; // reference value for this time period
  targetValue: number; // target value for the month. theoretically
  realValueWithActions: number; // real possible value for the month if all actions are done
  savedAbsolut: number; // saved absolut value in this year
  percentageToRef: number; // in this year active target percentage
  date: string; // Format: YYYY-MM-DD
  realValueWithActionsInterpolated?: null | number; // is null and only set in years with new finished actions
  targetValueInterpolated?: null | number; // is null and set only in years with new targets
}

export interface EmissionResult {
  monthlyResults: EmissionValue[];
  yearlyResults: EmissionValue[];
}

export function calculateEmissions(
  reportValues: OldReportValues[],
  targets: TargetEntry[],
  actions: ActionEntry[],
  referenceYear: number,
  referenceValue: number,
): EmissionResult {
  if (reportValues.length === 0) {
    throw new Error('No old values given');
  }

  // Sort old values and targets from old to new
  reportValues.sort((a, b) => a.year - b.year);
  targets.sort((a, b) => a.year - b.year);

  // Create a map of the old values
  const emissions = new Map<number, number>();
  reportValues.forEach((val) => emissions.set(val.year, val.value));

  const startYear = reportValues[0].year;
  const endYear = targets[targets.length - 1].year;

  const monthlyResults: EmissionValue[] = [];
  const yearlyResults: EmissionValue[] = [];

  // set some starting values
  let targetInPercentPointer = 0; // start with 0% target
  let interpolatedPercentagePartPerYear = getInterpolationPartUntilNextTarget(
    targets,
    startYear,
    0,
    0,
  );
  let interpolatedPercentagePartPointer = 0;
  let actualSustractionValue = 0;
  const referenceValuePerMonth = referenceValue / 12;

  // iterate over all years
  for (let year = startYear; year <= endYear; year++) {
    const yearValue = emissions.get(year) ?? referenceValue; // use reference value if no report value exists for this year
    const target = targets.find((t) => t.year === year); // check if a new target exists for this year. if not, use the last one

    // is a new target set this year?
    if (target) {
      targetInPercentPointer = target.percentage; // else use the last one

      // find the next target
      // if there is a next target, interpolate the percentage between the two targets as a yearly value
      // e.g. target 1: 2020, 10%, target 2: 2022, 40%, ...
      interpolatedPercentagePartPerYear = getInterpolationPartUntilNextTarget(
        targets,
        year,
        target.percentage,
        interpolatedPercentagePartPerYear,
      );
    }

    // calculate the interpolated absolute value that needs to be subtracted this year

    const absoluteValueForYear = yearValue * (1 - targetInPercentPointer / 100);
    const absoluteValueForYearInterpolated =
      (referenceValue * (100 - interpolatedPercentagePartPointer)) / 100;
    interpolatedPercentagePartPointer += interpolatedPercentagePartPerYear;

    const absoluteValuePerMonth = absoluteValueForYear / 12;

    let amount = 0;
    for (let month = 1; month <= 12; month++) {
      const actionsEffect = calculateActionsEffect(actions, year, month);
      actualSustractionValue += actionsEffect / 12;

      const withActions = referenceValuePerMonth - actualSustractionValue;
      amount += withActions;

      monthlyResults.push(
        createMonthlyResult(
          year,
          month,
          referenceYear,
          referenceValue,
          referenceValuePerMonth,
          absoluteValuePerMonth,
          withActions,
          targetInPercentPointer,
        ),
      );
    }

    const yearlyActionEffect = calculateYearlyActionsEffect(actions, year);
    const realValueWithActionsInterpolated =
      calculateRealValueWithActionsInterpolated(
        year,
        yearlyActionEffect,
        startYear,
        endYear,
        amount,
        referenceValue,
      );

    yearlyResults.push(
      createYearlyResult(
        year,
        referenceYear,
        referenceValue,
        targetInPercentPointer,
        absoluteValueForYear,
        amount,
        realValueWithActionsInterpolated,
        absoluteValueForYearInterpolated,
      ),
    );
  }

  return { yearlyResults, monthlyResults };
}

function getInterpolationPartUntilNextTarget(
  targets: TargetEntry[],
  year: number,
  lastValue: number,
  interpolatedPercentagePartPerYear: number,
) {
  const nextTarget = targets.find((t) => t.year > year);
  if (nextTarget) {
    const yearsBetweenTargets = nextTarget.year - year;
    const percentageDifference = nextTarget.percentage - lastValue;
    interpolatedPercentagePartPerYear =
      percentageDifference / yearsBetweenTargets;
  }
  return interpolatedPercentagePartPerYear;
}

function calculateActionsEffect(
  actions: ActionEntry[],
  year: number,
  month: number,
): number {
  return actions
    .filter((action) => action.relevant && action.finished_until_planned)
    .filter((action) => {
      const date = new Date(action.finished_until_planned!);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    })
    .reduce((acc, action) => acc + action.target_value_absolut_planned, 0);
}

function calculateYearlyActionsEffect(
  actions: ActionEntry[],
  year: number,
): number {
  return actions
    .filter((action) => action.relevant && action.finished_until_planned)
    .filter(
      (action) =>
        new Date(action.finished_until_planned!).getFullYear() === year,
    )
    .reduce((acc, action) => acc + action.target_value_absolut_planned, 0);
}

function createMonthlyResult(
  year: number,
  month: number,
  referenceYear: number,
  referenceValue: number,
  referenceValuePerMonth: number,
  absoluteValuePerMonth: number,
  withActions: number,
  targetInPercentPointer: number,
): EmissionValue {
  return {
    realReportValue:
      year === referenceYear && month === 1 ? referenceValue : null,
    date: new Date(year, month - 1).toISOString(),
    refValue: referenceValuePerMonth,
    targetValue: absoluteValuePerMonth,
    realValueWithActions: withActions,
    savedAbsolut: absoluteValuePerMonth - withActions,
    percentageToRef: targetInPercentPointer,
  };
}

function createYearlyResult(
  year: number,
  referenceYear: number,
  referenceValue: number,
  targetInPercentPointer: number,
  absoluteValueForYear: number,
  amount: number,
  realValueWithActionsInterpolated: number | null,
  targetValueInterpolated: number | null,
): EmissionValue {
  return {
    realReportValue: year === referenceYear ? referenceValue : null,
    date: new Date(year, 0).toISOString(),
    refValue: referenceValue,
    targetValue: referenceValue * (1 - targetInPercentPointer / 100),
    realValueWithActions: amount,
    percentageToRef: targetInPercentPointer,
    savedAbsolut: absoluteValueForYear - amount,
    realValueWithActionsInterpolated,
    targetValueInterpolated,
  };
}

function calculateRealValueWithActionsInterpolated(
  year: number,
  yearlyActionEffect: number,
  startYear: number,
  endYear: number,
  amount: number,
  referenceValue: number,
): number | null {
  if (yearlyActionEffect > 0 || year === endYear) {
    return amount;
  } else if (year === startYear) {
    return referenceValue;
  }
  return null;
}

// formats numbers to the german format (1.000,00), optional number of fractiondigits
export const numbersFormatter = (
  value: number,
  maximumFractionDigits: number = 2,
) => {
  const formatter = new Intl.NumberFormat('de-DE', {
    maximumFractionDigits,
  });
  return formatter.format(value);
};

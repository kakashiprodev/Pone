/**
 * This service is used to generate reports
 * It will use the data from the database and calculate the CO2 values
 * It will calculate chains of equivalent values
 * It will calculate the sum of all inputs
 */

import dataprovider from './dataprovider';
import { EquivalentEntry, InputEntry } from './types';
import { round } from '../pipes/index';

const months = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'nov',
  'dec',
];

/**
 * returns the yearly average equivalent factor
 */
export const getAverageEquivalent = (equivalent: Partial<EquivalentEntry>) => {
  let sum = 0;
  months.forEach((month) => {
    const m = month as keyof EquivalentEntry;
    if (equivalent[m] != null && typeof equivalent[m] === 'number') {
      sum += equivalent[m] as number;
    }
  });
  return sum / 12;
};

/**
 * Returns the sum of the input value multiplied its given equivalent factor
 * multiplication will be done for the monthly values if available
 */
export const getSumForInput = (
  input: InputEntry,
  equivalents: { [key: string]: EquivalentEntry },
): number => {
  // Monthly detailed calculation
  let sum = 0;
  months.forEach((month) => {
    // get the equivalent factor for the given month
    const key = 'raw' + month.charAt(0).toUpperCase() + month.slice(1); // e.g. rawJan, rawFeb, ...
    const monthlyEquivalentFactor = getFullFactorChain(
      input.equivalent,
      equivalents,
      month,
    );
    // @ts-ignore
    const monthlyRawValue = input.monthlyValues
      ? input[key]
      : input.rawValue / 12;
    sum += (monthlyRawValue ?? 0) * monthlyEquivalentFactor;
  });
  return sum;
};

/**
 * Returns the sum of all inputs multiplied with their equivalent factors
 * can handle a list of inputs
 */
export const getSumForInputs = (
  inputs: InputEntry[],
  equivalents: { [key: string]: EquivalentEntry },
) => {
  let sum = 0;
  inputs.forEach((input) => {
    sum += getSumForInput(input, equivalents);
  });
  return sum;
};

/**
 * helper funktion for getSumForInput
 * Calculates the equivalent factor for the given equivalent id and month
 * will also calculate the parent equivalent factors
 * returns the factor with all parent factors multiplied
 */
const getFullFactorChain = (
  equivalentId: null | string,
  equivalents: { [key: string]: EquivalentEntry },
  month: string,
): number => {
  if (!equivalentId || equivalentId === '') {
    return 1;
  }

  const equivalent: any = equivalents[equivalentId];
  if (!equivalent) {
    console.error('Equivalent not found for id ' + equivalentId);
    return 1;
  }

  const parentFactor = getFullFactorChain(
    equivalent.parent,
    equivalents,
    month,
  );

  // use monthly value if available, otherwise use yearly average value
  const monthlyValue: number =
    equivalent[month] != null && equivalent[month] != ''
      ? equivalent[month]
      : equivalent.avgValue;
  return monthlyValue * parentFactor;
};

/**
 * Returns the sum of all inputs grouped by their scope
 * This is needed for the report
 */
export const getScopeSums = async () => {
  const equivalents = await dataprovider.readEquivalentsAsDict();

  const [scope1, scope2, scope3] = await Promise.all([
    dataprovider.readUserInputs({ scope: [1] }),
    dataprovider.readUserInputs({ scope: [2] }),
    dataprovider.readUserInputs({ scope: [3] }),
  ]);

  return {
    scope1: {
      list: getListOfInputValues(scope1, equivalents),
      sum: scope1.reduce((sum, input) => {
        return sum + input.sumValue;
      }, 0),
    },
    scope2: {
      list: getListOfInputValues(scope2, equivalents),
      sum: scope2.reduce((sum, input) => {
        return sum + input.sumValue;
      }, 0),
    },
    scope3: {
      list: getListOfInputValues(scope3, equivalents),
      sum: scope3.reduce((sum, input) => {
        return sum + input.sumValue;
      }, 0),
    },
  };
};

/**
 * helper function for getScopeSums
 * Creates a list of caluclations in a simple format
 */
export const getListOfInputValues = (
  inputs: InputEntry[],
  equivalents: { [key: string]: EquivalentEntry },
) => {
  return inputs.map((input) => {
    return {
      name: input.name,
      Comment: input.comment,
      value: getSumForInput(input, equivalents),
    };
  });
};

/**
 * Returns a list of strings with the calculation steps as a human readable format
 */
export const getCalculationSteps = (
  input: InputEntry,
  equivalents: { [key: string]: EquivalentEntry },
): string[] => {
  const steps: string[] = [];
  calculateEquivalentFactorWithSteps(
    input,
    input.equivalent,
    equivalents,
    steps,
  );
  return steps;
};

/**
 * helper function for getCalculationSteps
 */
const calculateEquivalentFactorWithSteps = (
  input: InputEntry,
  equivalentId: null | string,
  equivalents: { [key: string]: EquivalentEntry },
  steps: string[],
): void => {
  if (!equivalentId || equivalentId === '') {
    return;
  }

  // search for the equivalent
  const equivalent = equivalents[equivalentId];
  if (!equivalent) {
    throw new Error('Equivalent is undefined for ID ' + equivalentId);
  }
  // create a clone that is needed for nested calculations
  const fakeInput: InputEntry = JSON.parse(JSON.stringify(input));
  fakeInput.rawValue = 0;

  // Monthly detailed calculation
  steps.push('Berechnungsschritt:');
  for (const month of months) {
    const key = 'raw' + month.charAt(0).toUpperCase() + month.slice(1); // e.g. rawJan, rawFeb, ...
    // @ts-ignore
    const monthlyEquivalentFactor =
      equivalent[month] != null && equivalent[month] != ''
        ? equivalent[month]
        : equivalent.avgValue;
    // @ts-ignore
    const monthlyRawValue = input.monthlyValues
      ? input[key]
      : input.rawValue / 12;
    const montlySum = monthlyRawValue * monthlyEquivalentFactor;
    // @ts-ignore
    fakeInput[key] = montlySum;
    fakeInput.rawValue += montlySum;
    steps.push(
      `${month !== 'jan' ? '+ ' : ''} ${monthlyRawValue}[${
        equivalent.in
      }] * ${monthlyEquivalentFactor}[${equivalent.in}/${
        equivalent.out
      }] = ${round(montlySum, 3)}[${equivalent.out}] (für ${month})`,
    );
  }
  steps.push(''); // empty line

  // if parent is null, we are at the root
  // otherwise we need to calculate the parent the output value with the parent
  if (equivalent.parent) {
    return calculateEquivalentFactorWithSteps(
      fakeInput,
      equivalent.parent,
      equivalents,
      steps,
    );
  }
};

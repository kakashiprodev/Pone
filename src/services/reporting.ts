/**
 * This service is used to generate reports
 * It will use the data from the database and calculate the CO2 values
 * It will calculate chains of equivalent values
 * It will calculate the sum of all inputs
 */

import dataprovider from "./dataprovider";
import { EquivalentEntry, InputEntry } from "./types";
import { round } from "../pipes/index";

const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "nov",
  "dec",
];

export const getAverageFromArray = (arr: number[]) => {
  let sum = 0;
  arr.forEach((val) => {
    sum += val;
  });
  return sum / arr.length;
};

export const getAverageEquivalent = (equivalent: Partial<EquivalentEntry>) => {
  let sum = 0;
  months.forEach((month) => {
    const m = month as keyof EquivalentEntry;
    if (equivalent[m] != null && typeof equivalent[m] === "number") {
      sum += equivalent[m] as number;
    }
  });
  return sum / 12;
};

/**
 * Returns the sum of the input value multiplied with the equivalent factor
 */
export const getSumForInput = (
  input: InputEntry,
  equivalents: { [key: string]: EquivalentEntry },
): number => {
  return calculateEquivalentFactor(input.equivalent, equivalents) *
    input.rawValue;
};

const calculateEquivalentFactor = (
  equivalentId: null | string,
  equivalents: { [key: string]: EquivalentEntry },
): number => {
  if (!equivalentId || equivalentId === "") {
    return 1;
  }

  const equivalent = equivalents[equivalentId];
  if (!equivalent) {
    console.error("Equivalent not found for id " + equivalentId);
    return 1;
    // throw new Error("Factor is undefined for users input " + equivalentId);
  }

  const parentFactor = calculateEquivalentFactor(
    equivalent.parent,
    equivalents,
  );
  return equivalent.avgValue * parentFactor;
};

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

// ausgabe als schrift:
export const getCalculationSteps = (
  input: InputEntry,
  equivalents: { [key: string]: EquivalentEntry },
): string[] => {

  const steps: string[] = [];
  calculateEquivalentFactorWithSteps(
    input.rawValue,
    input.equivalent,
    equivalents,
    steps,
  );
  return steps;
};

const calculateEquivalentFactorWithSteps = (
  value: number,
  equivalentId: null | string,
  equivalents: { [key: string]: EquivalentEntry },
  steps: string[],
): number => {
  if (!equivalentId) {
    return value;
  }

  // search for the equivalent
  const equivalent = equivalents[equivalentId];
  if (!equivalent) {
    throw new Error("Equivalent is undefined for ID " + equivalentId);
  }

  const calculatedValue = value * equivalent.avgValue;

  steps.push(
    `${value}[${equivalent.in}] * ${equivalent.avgValue}[${equivalent.in}/${equivalent.out}] = ${round(calculatedValue, 3)}[${equivalent.out}]`,
  );

  // if parent is null, we are at the root
  // otherwise we need to calculate the parent the output value with the parent
  if (equivalent.parent) {
    return calculateEquivalentFactorWithSteps(
      calculatedValue,
      equivalent.parent,
      equivalents,
      steps,
    );
  } else {
    return calculatedValue;
  }
};
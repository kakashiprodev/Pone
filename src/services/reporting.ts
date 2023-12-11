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

  const scope1 = await dataprovider.readUserInputs({ scope: [1] });
  const scope2 = await dataprovider.readUserInputs({ scope: [2] });
  const scope3 = await dataprovider.readUserInputs({ scope: [3] });

  return {
    scope1: {
      list: getListOfInputValues(scope1, equivalents),
      sum: getSumForInputs(scope1, equivalents),
    },
    scope2: {
      list: getListOfInputValues(scope2, equivalents),
      sum: getSumForInputs(scope2, equivalents),
    },
    scope3: {
      list: getListOfInputValues(scope3, equivalents),
      sum: getSumForInputs(scope3, equivalents),
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

  const equivalent = equivalents[equivalentId];
  if (!equivalent) {
    throw new Error("Equivalent is undefined for ID " + equivalentId);
  }

  // Wenn ein Parent vorhanden ist, dann den Wert für den Parent zuerst berechnen
  const parentValue = calculateEquivalentFactorWithSteps(
    value,
    equivalent.parent,
    equivalents,
    steps,
  );

  const intermediateResult = parentValue * equivalent.avgValue;
  steps.push(
    `${parentValue}[${equivalent.in}] * ${equivalent.avgValue}[${equivalent.in}/${equivalent.out}] = ${round(intermediateResult, 3)}[${equivalent.out}]`,
  );

  return intermediateResult;
};
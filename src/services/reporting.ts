import dataprovider from "./dataprovider";
import { Equivalent, UserInput } from "./types";

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

export const getAverageEquivalent = (equivalent: Partial<Equivalent>) => {
  let sum = 0;
  months.forEach((month) => {
    const m = month as keyof Equivalent;
    if (equivalent[m] != null && typeof equivalent[m] === "number") {
      sum += equivalent[m] as number;
    }
  });
  return sum / 12;
};

export const getSumForInput = (
  input: UserInput,
  equivalents: { [key: string]: Equivalent },
) => {
  let sum = 0;
  let factor = input.equivalentManual;
  // check if equivalentRef is set. then overwrite factor with equivalent avg value
  console.log("equivalentRef: ", input.equivalent);
  if (input.equivalent) {
    console.log("equivalentRef: ", input.equivalent);
    if (equivalents[input.equivalent]) {
      factor = equivalents[input.equivalent].avgValue;
    }
  }
  if (!factor) {
    throw new Error("Factor is undefined for users input " + input.name);
  }
  sum += input.sumValue * factor;
  return sum;
};

export const getSumForInputs = (
  inputs: UserInput[],
  equivalents: { [key: string]: Equivalent },
) => {
  let sum = 0;
  inputs.forEach((input) => {
    sum += getSumForInput(input, equivalents);
  });
  return sum;
};

export const getListOfInputValues = (
  inputs: UserInput[],
  equivalents: { [key: string]: Equivalent },
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

  const scope1 = await dataprovider.readUserInputs({ scope: "scope1" });
  const scope2 = await dataprovider.readUserInputs({ scope: "scope2" });
  const scope3 = await dataprovider.readUserInputs({ scope: "scope3" });

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

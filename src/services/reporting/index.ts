/**
 * This service is used to generate reports
 * It will use the data from the database and calculate the CO-2 values
 * It will calculate chains of equivalent values
 * It will calculate the sum of all inputs
 */

import dataprovider from '../dataprovider';
import {
  EquivalentEntry,
  InputEntry,
  InputEntryWithExpandedReportAndSite,
} from '../types';
import { roundStringWithDecimals } from '../pipes/index';

type monthsShort =
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';
const months: monthsShort[] = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

type MonthsFullDict = {
  [K in monthsShort]: string;
};

const monthsFullDict: MonthsFullDict = {
  jan: 'Januar',
  feb: 'Februar',
  mar: 'März',
  apr: 'April',
  may: 'Mai',
  jun: 'Juni',
  jul: 'Juli',
  aug: 'August',
  sep: 'September',
  oct: 'Oktober',
  nov: 'November',
  dec: 'Dezember',
};

// const DEMO_DATA: TimeseriesDataEntry[] = [
//   {
//     id: 'klcg79e5h2xlob6',
//     name: 'Strom 2022',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 2,
//     comment: 'MVV',
//     sumValue: 0,
//     equivalent: 'dcofpiv5psyepya',
//     category: 'Bezug von Strom',
//     facility: 'h5r19yd2fr93q5c',
//   },
//   {
//     id: 'l8ilg6xia6ecjmm',
//     name: 'Erdgas​',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 1,
//     comment: '',
//     sumValue: 0,
//     equivalent: 'lietqnza86p7kcd',
//     category: 'Direkter Brennstoffeinsatz',
//     facility: 'h5r19yd2fr93q5c',
//   },
//   {
//     id: 'o9e1hljkk2mk0ed',
//     name: 'Diesel',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 1,
//     comment: '15 Fahrzeuge',
//     sumValue: 0,
//     equivalent: '',
//     category: 'Flottenverbrauch',
//     facility: '',
//   },
//   {
//     id: 'owzv54dxq8uu4i8',
//     name: 'Heizöl',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 1,
//     comment: '',
//     sumValue: 0,
//     equivalent: 'gqy84dn063ge9lj',
//     category: 'Direkter Brennstoffeinsatz',
//     facility: '6j0eeeffwwnc8r3',
//   },
//   {
//     id: 's45laddb0wpxuej',
//     name: 'Rohbenzin',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 1,
//     comment: '2 Fahrzeuge',
//     sumValue: 0,
//     equivalent: 'fwxryry9l3bvd0x',
//     category: 'Flottenverbrauch',
//     facility: '',
//   },
//   {
//     id: 'tbv000jegafh5e8',
//     name: 'Fernwärme Biogas',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 2,
//     comment: '',
//     sumValue: 0,
//     equivalent: 'xrmh02j3d52qujk',
//     category: 'Bezug von Fernwärme',
//     facility: '',
//   },
//   {
//     id: 'tfmdaqyauw1778y',
//     name: ' Harnstoff',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 3,
//     comment: 'test von björn',
//     sumValue: 566039.7599266667,
//     equivalent: 'ttard1egy6xuq7s',
//     category: 'Chemische Grundstoffe und Produkte',
//     facility: 'h5r19yd2fr93q5c',
//   },
//   {
//     id: 'ybppa5gxalc2n6s',
//     name: 'R410A​',
//     year: 2022,
//     timestamp: '2022-01-01T00:00:00.000Z',
//     site: 'Astorplast Zentrale',
//     report: 'l4qvifdxxgja1xy',
//     scope: 1,
//     comment: 'Im Kalenderjahr nachgefüllt',
//     sumValue: 0,
//     equivalent: '2y1eq120gd0pon5',
//     category: 'Technische Gase',
//     facility: '',
//   },
// ];

/**
 * returns the yearly average equivalent factor
 */
export const getAverageEquivalent = (equivalent: Partial<EquivalentEntry>) => {
  let sum = 0;
  let cnt = 0;
  months.forEach((month) => {
    const m = month as keyof EquivalentEntry;
    if (equivalent[m] != null && typeof equivalent[m] === 'number') {
      sum += equivalent[m] as number;
      cnt++;
    }
  });
  return sum / cnt;
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
    const key = 'raw_value_' + month; // e.g. raw_value_jan, ...
    const monthlyEquivalentFactor = getFullFactorChain(
      input.equivalent,
      equivalents,
      month,
    );
    // @ts-ignore
    const monthlyRawValue = input.monthly_values
      ? input[key as keyof InputEntry]
      : input.raw_value / 12;
    sum += ((monthlyRawValue as any) ?? 0) * monthlyEquivalentFactor;
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
      : equivalent.avg_value;
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
        return sum + input.sum_value;
      }, 0),
    },
    scope2: {
      list: getListOfInputValues(scope2, equivalents),
      sum: scope2.reduce((sum, input) => {
        return sum + input.sum_value;
      }, 0),
    },
    scope3: {
      list: getListOfInputValues(scope3, equivalents),
      sum: scope3.reduce((sum, input) => {
        return sum + input.sum_value;
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
  fakeInput.raw_value = 0;

  // Monthly detailed calculation
  steps.push('Berechnungsschritt ' + (steps.length + 1));
  for (const month of months) {
    const key = 'raw' + month.charAt(0).toUpperCase() + month.slice(1); // e.g. rawValueJan, rawValueFeb, ...
    // @ts-ignore
    const monthlyEquivalentFactor: number =
      equivalent[month as keyof EquivalentEntry] != null &&
      equivalent[month as keyof EquivalentEntry] != ''
        ? equivalent[month as keyof EquivalentEntry]
        : equivalent.avg_value;
    // @ts-ignore
    const monthlyRawValue: number = input.monthlyValues
      ? input[key as keyof InputEntry]
      : input.raw_value / 12;
    const montlySum = monthlyRawValue * ((monthlyEquivalentFactor as any) ?? 0);
    // @ts-ignore
    fakeInput[key] = montlySum;
    fakeInput.raw_value += montlySum;
    steps.push(
      `${month !== 'jan' ? '+ ' : ''} ${roundStringWithDecimals(
        monthlyRawValue,
        3,
      )}${equivalent.in} * ${roundStringWithDecimals(
        monthlyEquivalentFactor,
        3,
      )}${equivalent.in}/${equivalent.out} = ${roundStringWithDecimals(
        montlySum,
        3,
      )}${equivalent.out} (für ${monthsFullDict[month]})`,
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

export type ReportGroupBy = 'scope' | 'category' | 'facility';

export interface ReportTimeseriesQuery {
  projectId: string;
  siteIds: string[]; // filter by sites
  filter: {
    scope?: number[];
    category?: string[];
    facility?: string[];
    years: number[];
  };
}

// simpler data entry for the report
interface DataEntry {
  id: string;
  name: string;
  timestamp: string; // ISO 8601
  scope: number;
  comment: string;
  sumValue: number;
  equivalent: string;
  category: string;
  facility: string;
}

// timeseries data entry for the report
export interface TimeseriesDataEntry extends DataEntry {
  year: number;
  site: string;
  report: string;
}

export interface AggregatedReportResult {
  stat: {
    sum: number; // over all data
  };
  timeseries: {
    [name: string]: {
      name: string;
      year: number;
      timestamp: string;
      sum: number;
    }[];
  };
}

export interface AggregatedReportResultYearlyGrouped {
  stat: {
    sum: number; // over all data
  };
  yearlyGrouped: {
    [year: string]: {
      stat: {
        sum: number; // over all data for the year
      };
      grouped: {
        [name: string]: number; // sum for each groupBy value
      };
      timeseries: {
        [name: string]: {
          // timeseries for each groupBy value
          name: string;
          year: number;
          timestamp: string;
          sum: number;
        }[];
      };
    };
  };
}

/**
 * Helper to reduce the input data to a plain list of data entries
 */
const userInputsToDataEntries = (
  inputs: InputEntryWithExpandedReportAndSite[],
): TimeseriesDataEntry[] => {
  return inputs.map((input) => {
    return {
      id: input.id,
      name: input.name,
      year: input.report.year,
      timestamp: input.report.year + '-01-01T00:00:00.000Z',
      site: input.report.site.name,
      report: input.report.id,
      scope: input.scope,
      comment: input.comment,
      sumValue: input.sum_value,
      equivalent: input.equivalent ?? '',
      category:
        input.category && input.category !== ''
          ? input.category
          : 'Ohne Zuordnung',
      facility:
        input.facility && input.facility.name
          ? input.facility.name
          : 'Ohne Zuordnung',
    };
  });
};

/**
 * Helper to filter the input data
 */
const filterDataEntries = (
  data: TimeseriesDataEntry[],
  filter: ReportTimeseriesQuery['filter'],
): TimeseriesDataEntry[] => {
  return data.filter((entry) => {
    return (
      (!filter.scope || filter.scope.includes(entry.scope)) &&
      (!filter.category || filter.category.includes(entry.category)) &&
      (!filter.facility || filter.facility.includes(entry.facility)) &&
      filter.years.includes(entry.year)
    );
  });
};

/**
 * Get plain timeseries for the given query for all years
 * If a site has no data for a year, it will be skipped
 */
const littleDataCache: {
  lease: Date;
  data: InputEntryWithExpandedReportAndSite[];
} = {
  lease: new Date('1970-01-01'),
  data: [],
};
export const getPlainReportData = async (
  query: ReportTimeseriesQuery,
): Promise<TimeseriesDataEntry[]> => {
  // check if the data is still valid. The lease time is 2 minutes to prevent multiple requests
  const needRefresh =
    new Date().getTime() - littleDataCache.lease.getTime() > 120000;

  let data: InputEntryWithExpandedReportAndSite[] = [];
  if (needRefresh) {
    // get all data. not filtered by years, because we need to filter it later
    data = await dataprovider.readUserInputsForProjectExtendFields(
      query.projectId,
    );

    littleDataCache.data = data;
    littleDataCache.lease = new Date();
  } else {
    data = littleDataCache.data;
  }

  // map to simpler data entry
  const filtered = filterDataEntries(
    userInputsToDataEntries(data),
    query.filter,
  );
  return filtered;
};

/**
 * Get the grouped report data for the given query
 * The data will be grouped by the given groupBy key
 * The result will be aggregated for each groupBy value
 */
export const getGroupedReportData = async (
  query: ReportTimeseriesQuery,
  groupBy: ReportGroupBy,
): Promise<AggregatedReportResult> => {
  const plainData: TimeseriesDataEntry[] = await getPlainReportData(query);
  const result: AggregatedReportResult = {
    stat: {
      sum: 0,
    },
    timeseries: {
      // 'group-a': [],
    },
  };
  // Order Years from low to high
  const orderedYears = query.filter.years.sort((a, b) => a - b);

  // First get all possible values for the groupBy key
  const groupByValues = new Set<string>();
  plainData.forEach((entry) => {
    groupByValues.add(entry[groupBy] + '');
  });

  // Create a Dictionary for each Year
  const years: { [year: number]: TimeseriesDataEntry[] } = {};
  for (const year of orderedYears) {
    years[year] = plainData.filter((entry) => entry.year === year);
  }

  // Iterate over all queried years
  // ==> Iterate over all groupBy values and generate a timeseries entry for each
  // ==> Calculate the sum for each groupBy value
  // If a year or a groupBy value has no data, it will be filled with 0 to have a consistent result!
  for (const year of orderedYears) {
    for (const value of groupByValues) {
      const entries = years[year].filter(
        (entry) => entry[groupBy] + '' === value,
      );

      result.timeseries[value] = result.timeseries[value] ?? [];
      if (entries.length === 0) {
        // add a 0 entry for the missing groupBy value
        result.timeseries[value].push({
          name: value,
          year,
          timestamp: year + '-01-01T00:00:00.000Z',
          sum: 0,
        });
      } else {
        const sum = entries.reduce((sum, entry) => {
          return sum + entry.sumValue;
        }, 0);
        result.stat.sum += sum;
        result.timeseries[value].push({
          name: value,
          year,
          timestamp: year + '-01-01T00:00:00.000Z',
          sum,
        });
      }
    }
  }

  return result;
};

/**
 * Get the grouped report data for the given query
 * The data will be grouped by year and then by the given groupBy key
 */
export const getYearlyGroupedReportData = async (
  query: ReportTimeseriesQuery,
  groupBy: ReportGroupBy,
  includeTimeseries = false,
): Promise<AggregatedReportResultYearlyGrouped> => {
  const plainData: TimeseriesDataEntry[] = await getPlainReportData(query);
  const result: AggregatedReportResultYearlyGrouped = {
    stat: {
      sum: 0,
    },
    yearlyGrouped: {},
  };

  // Order Years from low to high
  const orderedYears = query.filter.years.sort((a, b) => a - b);

  // First get all possible values for the groupBy key
  const groupByValues = new Set<string>();
  plainData.forEach((entry) => {
    groupByValues.add(entry[groupBy] + '');
  });

  // Create a Dictionary for each Year
  const years: { [year: number]: TimeseriesDataEntry[] } = {};
  for (const year of orderedYears) {
    years[year] = plainData.filter((entry) => entry.year === year);
  }

  result.yearlyGrouped = plainData.reduce(
    (acc: AggregatedReportResultYearlyGrouped['yearlyGrouped'], item) => {
      const year = new Date(item.timestamp).getFullYear();
      if (!acc[year]) {
        acc[year] = {
          stat: {
            sum: 0,
          },
          grouped: {},
          timeseries: {},
        };
      }

      if (!acc[year].grouped[item[groupBy]]) {
        acc[year].grouped[item[groupBy]] = 0;
      }
      acc[year].grouped[item[groupBy]] += item.sumValue;

      // Update also sums
      acc[year].stat.sum += item.sumValue;
      result.stat.sum += item.sumValue;

      if (!acc[year].timeseries[item[groupBy]]) {
        acc[year].timeseries[item[groupBy]] = [];
      }

      if (includeTimeseries) {
        acc[year].timeseries[item[groupBy]].push({
          name: item.name,
          year,
          timestamp: item.timestamp,
          sum: item.sumValue,
        });
      }

      return acc;
    },
    {},
  );

  return result;
};

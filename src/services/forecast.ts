import { ActionEntry, TargetEntry } from "./types";

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

export interface EmissionValues {
    refValue: number; // reference value for the month
    targetValue: number; // target value for the month. theoretically
    realValueWithActions: number; // real possible value for the month if all actions are done
    savedAbsolut: number; // saved absolut value in this year
    percentageToRef: number; // in this year active target percentage
    date: string; // Format: YYYY-MM-DD   
}

export interface EmissionResult {
    monthlyResults: EmissionValues[];
    yearlyResults: EmissionValues[];
}

export function calculateEmissions(
    oldValues: OldReportValues[],
    targets: TargetEntry[],
    actions: ActionEntry[],
    referenceYear: number
): EmissionResult {

    if (oldValues.length === 0) {
        throw new Error('No old values given');
    }

    // sort old values from old to new
    oldValues.sort((a, b) => a.year - b.year);

    // sort targets from old to new
    targets.sort((a, b) => a.year - b.year);

    // create a map of the old values
    const emissions = new Map<number, number>();
    oldValues.forEach(val => emissions.set(val.year, val.value));

    // get the reference value
    const referenceValue = emissions.get(referenceYear);
    if (!referenceValue) {
        throw new Error(`No reference value for year ${referenceYear}`);
    }

    // last year from old values
    const startYear = oldValues[0].year;
    // last year from targets
    const endYear = targets[targets.length - 1].year;

    // iterate from start to end and calculate the emissions per month
    const monthlyResults = [];
    const yearlyResults = [];

    // set the main target percentage here since this will effect all years after start year of the target
    let actualTargetPercentage = 0;
    let actualSustractionValue = 0;

    // calculate the fixes monthly value for the years without targets and actions
    const referenceValuePerMonth = referenceValue / 12;

    for (let year = startYear; year <= endYear; year++) {

        // check if a real value exists for the year. if not use the reference value
        const yearValue: number = emissions.get(year) ?? referenceValue;
        // console.log('Jahr: ' + year + ' Wert: ' + yearValue);

        // check if a target in [%] exists for the year. if not use 0[%]
        const target = targets.find(t => t.year === year);
        // overwrite the target percentage if a target exists. if not use the old target percentage
        actualTargetPercentage = target ? target.percentage : actualTargetPercentage;

        // normal value for the month including calulations of targets
        const absoluteValueForYear = yearValue * (1 - actualTargetPercentage / 100)

        // normal monthly value for the month without actions and targets
        const absoluteValuePerMonth = absoluteValueForYear / 12;

        // iterate over the months of the year
        let amount = 0;
        for (let month = 1; month <= 12; month++) {

            // check if an action exists for the year and the actual pointer month. if not use 0.
            const actionsEffect = actions
                .filter(action => {
                    const date = new Date(action.finishedUntil);
                    return date.getFullYear() === year && date.getMonth() === month - 1;
                })
                .reduce((acc, action) => acc + action.targetInTons, 0);

            // add this value (part for one month) to the floating subtraction value
            actualSustractionValue += (actionsEffect / 12);
            // debug
            // if (actionsEffect > 0) {
            //     console.log('Jahr: ' + year + ', Monat: ' + month + ' Ab jetzt spart eine Maßnahme: ' + actionsEffect);
            // }
            // console.log('Gesamteinsparung aktuell: ' + actualSustractionValue);

            // calculate the real value for the month minus the comulated actions
            const withActions = referenceValuePerMonth - actualSustractionValue;
            amount += withActions;

            monthlyResults.push({
                date: (new Date(year, month - 1)).toISOString(),
                refValue: referenceValuePerMonth,
                targetValue: absoluteValuePerMonth,
                realValueWithActions: withActions,
                savedAbsolut: absoluteValuePerMonth - withActions,
                percentageToRef: actualTargetPercentage
            });
        }

        // add values for the year
        const yearResult = {
            date: (new Date(year, 0)).toISOString(),
            refValue: referenceValue,
            targetValue: referenceValue * (1 - actualTargetPercentage / 100),
            realValueWithActions: amount,
            percentageToRef: actualTargetPercentage,
            savedAbsolut: absoluteValueForYear - amount
        };
        // console.log(yearResult);
        yearlyResults.push(yearResult);
    }

    return { yearlyResults, monthlyResults };
}
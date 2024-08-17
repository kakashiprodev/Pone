import statusTranslations from '../statusTranslations';
import { ActionEntry, EquivalentEntry, InputEntry } from '../types';

/**
 * Exports the given actions as CSV file
 */
export const getActionsAsCsv = async (actions: ActionEntry[]) => {
  // export data as CSV and download
  let csv =
    'ID;Name;Verantwortlicher;Status;Fortschritt;Relevant;Standort;Beschreibung Vorher;Beschreibung Danach;Zielwert geplant;Zielwert tatsächlich;Beschreibung Zielwert;Fertigstellung geplant;Fertigstellung tatsächlich;Kategorie;Kosten geplant;Kosten tatsächlich;ROI;Kostenbeschreibung;Vermeidungs-Kosten\r\n';
  csv += actions
    .map((item) => {
      return [
        item.id,
        item.name,
        item.responsible,
        statusTranslations[item.status],
        item.progress,
        item.relevant ? 'Ja' : 'Nein',
        item.site,
        item.descriptionBefore,
        item.descriptionAfter,
        item.targetValueAbsolutPlanned,
        item.targetValueAbsolutIs,
        item.descriptionTargetValue,
        item.finishedUntilPlanned,
        item.finishedUntilIs,
        item.category,
        item.costsPlanned,
        item.costsIs,
        item.roi,
        item.descriptionTargetValue,
        item.avoidanceCosts,
      ].join(';');
    })
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Massnahmen_Export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
};

/**
 * Get all inputs as CSV file
 */
export const getInputsAsCsv = async (data: InputEntry[]) => {
  let csv =
    'ID;Name;Kommentar;Projekt;Scope;Menge;Eingabewert;Äquivalent;Gültigkeit\r\n';
  csv += data
    .map((item) => {
      return [
        item.id,
        item.name,
        item.comment,
        item.report,
        item.scope,
        item.sumValue,
        item.rawValue,
        item.equivalent,
        'item.year', // HACK!!!
      ].join(';');
    })
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Eingaben_Export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
};

/**
 * Get all equivalents as CSV file
 */
export const getEquivalentsAsCsv = async (equivalents: EquivalentEntry[]) => {
  const delimiter = ';';
  const eol = '\r\n';
  const toLocalStr = (v: any | null) => {
    if (v == null) {
      return '';
    } else if (typeof v === 'string') {
      return v;
    } else if (typeof v === 'number') {
      return v.toLocaleString();
    } else if (typeof v === 'boolean') {
      return v ? '1' : '0';
    } else {
      return v;
    }
  };
  const header = [
    { val: 'id', name: 'ID' },
    { val: 'scope', name: 'Scope' },
    { val: 'category', name: 'Kategorie' },
    { val: 'specification1', name: 'Spezifikation 1' },
    { val: 'specification2', name: 'Spezifikation 2' },
    { val: 'specification3', name: 'Spezifikation 3' },
    { val: 'addName1', name: 'Zusatzname' },
    { val: 'comment', name: 'Kommentar' },
    { val: 'in', name: 'Eingang' },
    { val: 'out', name: 'Ausgang' },
    { val: 'source', name: 'Quelle' },
    { val: 'avgValue', name: 'Faktor' },
    { val: 'monthlyValues', name: 'Monatliche Eingaben' },
    { val: 'jan', name: 'Wert-Jan (monatlich)' },
    { val: 'feb', name: 'Wert Feb (monatlich)' },
    { val: 'mar', name: 'Wert Mar (monatlich)' },
    { val: 'apr', name: 'Wert Apr (monatlich)' },
    { val: 'may', name: 'Wert May (monatlich)' },
    { val: 'jun', name: 'Wert Jun (monatlich)' },
    { val: 'jul', name: 'Wert Jul (monatlich)' },
    { val: 'aug', name: 'Wert Aug (monatlich)' },
    { val: 'sep', name: 'Wert Sep (monatlich)' },
    { val: 'oct', name: 'Wert Oct (monatlich)' },
    { val: 'nov', name: 'Wert Nov (monatlich)' },
    { val: 'dec', name: 'Wert Dec (monatlich)' },
    { val: 'parent', name: 'Überliegende Berechnung (ID)' },
    { val: 'project', name: 'Projekt' },
  ];

  const lines = equivalents
    .map((e: any) => {
      return header.map((h) => toLocalStr(e[h.val])).join(delimiter);
    })
    .join(eol);
  const csv = header.map((h) => h.name).join(delimiter) + eol + lines;
  const blob = new Blob([csv], { type: 'text/csv;charset=windows-1252;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'equivalents.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import statusTranslations from '../statusTranslations';
import { ActionEntry, InputEntry } from '../types';

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
        item.description_before,
        item.description_after,
        item.target_value_absolut_planned,
        item.target_value_absolut_is,
        item.description_target_value,
        item.finished_until_planned,
        item.finished_until_is,
        item.category,
        item.costs_planned,
        item.costs_is,
        item.roi,
        item.description_target_value,
        item.avoidance_costs,
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
        item.sum_value,
        item.raw_value,
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

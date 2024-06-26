export default {
  heading: 'Äquivalente und Faktoren',
  helpText:
    'Hier werden alle Äquivalente angezeigt, die für die Berechnung der\n' +
    '    CO<sub>2</sub>-Äquivalente verwendet werden können. Die System Einträge\n' +
    '    können nicht editiert oder gelöscht werden. Überliegende Berechnungen\n' +
    '    bedeuten, dass der Faktor in Kette mit dem überliegenden Faktor berechnet\n' +
    '    wird. Hierbei entspricht die Ausgangseinheit des Eingabewertes der\n' +
    '    Eingangseinheit des überliegenden Faktors.',
  choose: {
    heading: 'Wählen Sie einen Faktor',
    name: 'Name',
    comment: 'Kommentar',
    in: 'Eingang',
    out: 'Ausgang',
    cancel: 'Abbrechen',
  },
  create: 'Anlegen',
  edit: 'Bearbeiten',
  save: 'Speichern',
  scope: 'Scope',
  scopeInline: 'Zu welchem Scope gehört der Umrechnungsfaktor.',
  category: 'Kategorie',
  categoryInline: 'Die Kategorie wird für die Filterung verwendet,',
  spec1: 'Spezifikation 1 (Hauptname)',
  spec1Inline:
    'Dies ist der Hauptname. Es können bis zu drei Spezifikationen\n' +
    '          angegeben werden, falls Unterscheidungsmerkmale benötigt werden.',
  spec2: 'Spezifikation 2',
  spec3: 'Spezifikation 3',
  addName: 'Zusätzlicher Name',
  addNameInline:
    'Dies kann z.B. ein chemisches Formelzeichen sein oder eine alternative\n' +
    '          technische Bezeichnung zur besseren Suchbarkeit.',
  comment: 'Kommentar',
  commentInline: 'Eine optionale Bemerkung zur Eingabe',
  unitIn: 'Einheit Eingang',
  unitInInline:
    'Der "Eingang" entspricht der Einheit in der die Werte eingegeben\n' +
    '          werden.',
  unitOut: 'Einheit Ausgang',
  unitOutInline: `Der "Ausgang" entspricht der Einheit in die umgerechnet wird. Wenn
  keine übergeordnete Berechnung verknüpft wird muss(!) Die
  Ausgangseinheit kg-CO<sub>2</sub> entsprechen.`,
  source: 'Quelle',
  sourceInline: 'Angabe woher der Faktor stammt (Berechnungsgrundlage)',
  monthlyValues: 'Monatliche Eingaben',
  monthlyValuesInline:
    'Wenn dies aktiviert wird, können monatliche Eingaben erfolgen. Der\n' +
    '          Jahresmittelwert wird dann autoamtisch errechnet.',
  month: {
    '1': 'Jan',
    '2': 'Feb',
    '3': 'Mär',
    '4': 'Apr',
    '5': 'Mai',
    '6': 'Jun',
    '7': 'Jul',
    '8': 'Aug',
    '9': 'Sep',
    '10': 'Okt',
    '11': 'Nov',
    '12': 'Dez',
  },
  avgValue: 'Faktor (Jahresdurchschnitt)',
  autoCalc: 'automatisch berechnet',
  autoCalcInline:
    'Der Jahresdurchschnittswert als Faktor [Ausgangseinheit-pro-Eingangseinheit]',
  wrappingCalcOptional: 'Überliegende Berechnung (optional)',
  wrappingCalcOptionalInline: `Wenn eine überliegende Berechnung gewählt wird, muss die
          Ausgangseinheit der überliegenden Berechnung mit der Eingangseinheit
          dieses Faktors übereinstimmen. In dem Fall wird beim Berechnen der
          CO<sub>2</sub>-Äquivalete der überliegende Faktor in Kette mit diesem
          Faktors berechnet.`,
  chooseFactor: 'Wählen Sie einen Faktor',
  filterScope: 'Filter auf Scope',
  filterCat: 'Filter auf Kategorie',
  name: 'Name',
  namePlaceholder: 'Allgemeiner Textfilter auf alle Namen und Spezifikationen',
  unit: 'Einheit',
  table: {
    scope: 'Scope',
    category: 'Kategorie',
    name: 'Name',
    spec1: 'Spezifikation 1',
    spec2: 'Spezifikation 2',
    spec3: 'Spezifikation 3',
    addName: 'Zusatzname',
    inputUnit: 'Eingabe Einheit',
    factor: 'Faktor',
    outputUnit: 'Ausgabe Einheit',
    source: 'Quelle',
    parent: 'Verkettet',
    parentLong: 'Verkettete Berechnung',
    factorYear: 'Faktor (Jahresdurchschnitt)',
  },
  infoBox: {
    heading1: 'Scope 1: Direkte Emissionen',
    text1:
      'Emissionen aus eigenen oder kontrollierten Quellen. Beispiele: Emissionen\n' +
      '      von Verbrennungsprozessen in eigenen Anlagen, Fahrzeugemissionen',
    heading2: 'Scope 2: Indirekte Emissionen aus bezogener Energie',
    text2:
      'Emissionen aus der Erzeugung gekaufter oder sonstwie bezogener\n' +
      '      Elektrizität, Dampf, Wärme und Kühlung Beispiele: Emissionen durch\n' +
      '      Stromverbrauch, Fernwärme',
    heading3: 'Scope 3: Sonstige indirekte Emissionen',
    text3:
      'Emissionen, die nicht direkt aus eigenen oder kontrollierten Quellen\n' +
      '      stammen, aber mit der Wertschöpfungskette des Unternehmens verbunden sind\n' +
      '      Beispiele: Emissionen aus der Produktion bezogener Materialien und\n' +
      '      Dienstleistungen, Transport- und Distributionsaktivitäten, Emissionen aus\n' +
      '      der Entsorgung von verkauften Produkten, Geschäftsreisen, Pendlerverkehr\n' +
      '      der Mitarbeiter, Leasingaktivitäten, Investitionen',
  },
};

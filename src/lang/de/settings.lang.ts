export default {
  user: 'Benutzer',
  profile: 'Profil',
  changePassword: 'Passwort ändern',
  showDemo: '=> Zeige DataEngine Demo',
  genDemoData: '=> Generiere Demo Daten',
  currentProject: 'Aktuelles Projekt',
  projectGeneral: 'Projektverwaltung',
  projectReports: 'Berichtszeiträume',
  projectTargets: 'Zieldefinition',
  equivalents: 'Äquivalente',
  userSettings: {
    name: 'Name',
    heading: 'Persönliche Einstellungen',
    displayInTons: 'Darstellung in Tonnen',
    subHeading: 'Angaben',
    userName: 'Benutzername',
    email: 'E-Mail',
    firstName: 'Vorname',
    lastName: 'Nachname',
    department: 'Abteilung',
    role: 'Rolle',
    phone: 'Telefon',
    changePasswordHeading: 'Passwort ändern',
    oldPassword: 'Altes Passwort',
    newPassword: 'Neues Passwort',
    repeatPassword: 'Passwort wiederholen',
    changePassword: 'Passwort ändern',
  },
  targetSettings: {
    heading: 'Klimaziele',
    subHeading: 'Klimaziele für den gewählten Bericht definieren.',
    inlineMsg1:
      'Die Definition ist optional. Es kann die schrittweise Reduktion der\n' +
      '    Treibhausgasemissionen in Schritten eingegeben werden.',
    inlineMsg2:
      'Die Eingaben beziehen sich auf das Referenzjahr des Berichts. 100% bedeutet\n' +
      '    volle Klimeneutralität.<br />\n' +
      '    0% = Keine Einsparung. Verbrauch ist gleich dem des angegebenen Basisjahr\n' +
      '    des Berichts.',
    newStep: 'Neue Abstufung hinzufügen',
    year: 'Jahr',
    savedPercentage: 'Einsparung in %',
  },
  reportSettings: {
    heading: 'Berichte',
    subHeading:
      'Hier legen Sie die Berichtszeiträume für das ausgewählte Projekt fest. Jeder\n' +
      '    Bericht umfasst ein Jahr.',
    currentReport: 'Ausgewählter Bericht',
    newReport: 'Neuer Bericht',
    add: 'Hinzufügen',
    copyFromLastYear: 'Ziele aus dem Vorjahr kopieren',
    noReports:
      'Es sind noch keine Berichte vorhanden. Bitte legen Sie einen neuen Bericht an.',
    addReport: 'Bericht anlegen',
    title: 'Basisdaten des CO<sub>2</sub>-Berichts',
    reportId: 'Report ID',
    reportSite: 'Projekt-ID',
    reportYear: 'Jahr',
    companyNumbers: 'Unternehmenszahlen',
    companyName: 'Firmenname',
    companyStreet: 'Straße',
    companyPostal: 'PLZ',
    companyCity: 'Stadt',
    companyCountry: 'Land',
    companyDomain: 'Branche',
    contactName: 'Ansprechpartner',
    contactPhone: 'Telefon',
    contactMail: 'E-Mail',
    contactDepartment: 'Abteilung',
    countEmployees: 'Anzahl Mitarbeiter',
    yearlyFocus: 'Jahresumsatz',
    refYear: 'Referenzjahr',
    confirmDelete: 'Soll dieser Zeitraum wirklich gelöscht werden?',
    successDelete: 'Bericht wurde erfolgreich gelöscht.',
  },
  projectSettings: {
    companies: 'Unternehmen',
    sites: 'Standorte',
    companiesInline:
      'Hier können Sie Projekte anlegen und verwalten. Ein Projekt kann mehrere\n' +
      '        Standorte enthalten. Ein Standort wiederrum enthält beliebig viele\n' +
      '        Jahresberichte.',
    selectedProject: 'Ausgewähltes Projekt',
    projectSelectPlaceholder: 'Projekt wählen',
    noProjects:
      'Es sind keine Projekte vorhanden. Bitte legen Sie mind. ein Projekt an.',
    createProject: 'Projekt anlegen',
    logoOfCompany: 'Logo des Unternehmens',
    projectName: 'Projektname',
    projectNameInline:
      'Der Projektname kann der Name der Organisation sein. Der Projektname\n' +
      '            kann auch Organisation und Standort im Namen enthalten. Die\n' +
      '            Mindestlänge ist 4 Zeichen.',
    add: 'Hinzufügen',
    sitesInline:
      'Pro Projekt können mehrere Standorte definiert werden. Es muss mindestens\n' +
      '    ein Standort definiert sein. Der erste Standort ist der Hauptstandort und\n' +
      '    wurde vom System angelegt. Dieser kann jederzeit bearbeitet werden.',
    selectedSite: 'Ausgewählter Standort',
    selectedSitePlaceholder: 'Standort wählen',
    siteID: 'ID',
    siteIDInline:
      'Die ID wird automatisch vergeben und kann nicht geändert werden. Die\n' +
      '          Anzeige dient rein Support-Zwecken.',
    siteName: 'Standortname',
    siteNameInline:
      'Der Standortname kann frei bestimmt werden. Die Mindestlänge ist 3 Zeichen.',
  },
};

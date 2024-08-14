export default {
  user: 'User',
  profile: 'Profile',
  changePassword: 'Change Password',
  showDemo: '=> Show DataEngine Demo',
  genDemoData: '=> Generate Demo Data',
  currentProject: 'Current Project',
  projectGeneral: 'Project Management',
  projectReports: 'Reporting Periods',
  projectTargets: 'Target Definition',
  equivalents: 'Equivalents',
  wizard: 'Setup Wizard',
  userSettings: {
    name: 'Name',
    heading: 'Personal Settings',
    displayInTons: 'Display in Tons',
    subHeading: 'Details',
    userName: 'Username',
    email: 'Email',
    firstName: 'First Name',
    lastName: 'Last Name',
    department: 'Department',
    role: 'Role',
    phone: 'Phone',
    changePasswordHeading: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    repeatPassword: 'Repeat Password',
    changePassword: 'Change Password',
  },
  targetSettings: {
    heading: 'Climate Targets',
    subHeading: 'Define climate targets for the selected report.',
    inlineMsg1:
      'The definition is optional. You can input the step-by-step reduction of\n' +
      '    greenhouse gas emissions in stages.',
    inlineMsg2:
      'The inputs refer to the reference year of the report. 100% means\n' +
      '    full climate neutrality.<br />\n' +
      '    0% = No savings. Consumption is the same as the specified base year\n' +
      '    of the report.',
    newStep: 'Add New Step',
    year: 'Year',
    savedPercentage: 'Savings in %',
  },
  reportSettings: {
    heading: 'Reports',
    subHeading:
      'Here you define the reporting periods for the selected project. Each\n' +
      '    report covers one year.',
    currentReport: 'Selected Report',
    newReport: 'New Report',
    add: 'Add',
    copyFromLastYear: 'Copy Targets from Last Year',
    noReports: 'No reports are available yet. Please create a new report.',
    addReport: 'Create Report',
    title: 'Basic Data of the CO<sub>2</sub> Report',
    reportId: 'Report ID',
    reportSite: 'Project ID',
    reportYear: 'Year',
    companyNumbers: 'Company Numbers',
    companyName: 'Company Name',
    companyStreet: 'Street',
    companyPostal: 'Postal Code',
    companyCity: 'City',
    companyCountry: 'Country',
    companyDomain: 'Industry',
    contactName: 'Contact Person',
    contactPhone: 'Phone',
    contactMail: 'Email',
    contactDepartment: 'Department',
    countEmployees: 'Number of Employees',
    yearlyFocus: 'Annual Revenue',
    refYear: 'Reference Year',
    confirmDelete: 'Are you sure you want to delete this period?',
    successDelete: 'Report successfully deleted.',
  },
  projectSettings: {
    companies: 'Companies',
    sites: 'Sites',
    companiesInline:
      'Here you can create and manage projects. A project can contain multiple\n' +
      '        sites. A site, in turn, can contain any number of\n' +
      '        annual reports.',
    selectedProject: 'Selected Project',
    projectSelectPlaceholder: 'Select Project',
    noProjects:
      'No projects are available. Please create at least one project.',
    createProject: 'Create Project',
    logoOfCompany: 'Company Logo',
    projectName: 'Project Name',
    projectNameInline:
      'The project name can be the name of the organization. The project name\n' +
      '            can also include the organization and site in the name. The\n' +
      '            minimum length is 4 characters.',
    add: 'Add',
    sitesInline:
      'Multiple sites can be defined per project. At least one site must\n' +
      '    be defined. The first site is the main site and\n' +
      '    was created by the system. It can be edited at any time.',
    selectedSite: 'Selected Site',
    selectedSitePlaceholder: 'Select Site',
    siteID: 'ID',
    siteIDInline:
      'The ID is automatically assigned and cannot be changed. The\n' +
      '          display is purely for support purposes.',
    siteName: 'Site Name',
    siteNameInline:
      'The site name can be freely chosen. The minimum length is 3 characters.',
  },
};

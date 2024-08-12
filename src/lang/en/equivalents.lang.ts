export default {
  heading: 'Equivalents and Factors',
  helpText:
    'This section displays all equivalents that can be used for the calculation of CO<sub>2</sub> equivalents. System entries cannot be edited or deleted. Overlying calculations mean that the factor is calculated in conjunction with the overlying factor. The input unit of the entered value corresponds to the input unit of the overlying factor.',
  choose: {
    heading: 'Choose a Factor',
    name: 'Name',
    comment: 'Comment',
    in: 'Input',
    out: 'Output',
    cancel: 'Cancel',
  },
  create: 'Create',
  edit: 'Edit',
  save: 'Save',
  scope: 'Scope',
  scopeInline: 'To which scope does the conversion factor belong.',
  category: 'Category',
  categoryInline: 'The category is used for filtering.',
  spec1: 'Specification 1 (Main Name)',
  spec1Inline:
    'This is the main name. Up to three specifications can be provided if differentiation is needed.',
  spec2: 'Specification 2',
  spec3: 'Specification 3',
  addName: 'Additional Name',
  addNameInline:
    'This could be a chemical formula symbol or an alternative technical designation for better searchability.',
  comment: 'Comment',
  commentInline: 'An optional remark for the entry',
  unitIn: 'Input Unit',
  unitInInline:
    "The 'Input' corresponds to the unit in which the values are entered.",
  unitOut: 'Output Unit',
  unitOutInline:
    "The 'Output' corresponds to the unit to which the value is converted. If no overlying calculation is linked, the output unit must(!) correspond to kg-CO<sub>2</sub>.",
  source: 'Source',
  sourceInline: 'Indicate where the factor originates (calculation basis)',
  monthlyValues: 'Monthly Entries',
  monthlyValuesInline:
    'If enabled, monthly entries can be made. The annual average value will then be automatically calculated.',
  month: {
    '1': 'Jan',
    '2': 'Feb',
    '3': 'Mar',
    '4': 'Apr',
    '5': 'May',
    '6': 'Jun',
    '7': 'Jul',
    '8': 'Aug',
    '9': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  },
  avgValue: 'Factor (Annual Average)',
  autoCalc: 'Automatically Calculated',
  autoCalcInline:
    'The annual average value as a factor [output unit per input unit]',
  wrappingCalcOptional: 'Overlying Calculation (Optional)',
  wrappingCalcOptionalInline:
    'If an overlying calculation is selected, the output unit of the overlying calculation must match the input unit of this factor. In this case, the overlying factor will be calculated in conjunction with this factor when calculating CO<sub>2</sub> equivalents.',
  chooseFactor: 'Choose a Factor',
  filterScope: 'Filter by Scope',
  filterCat: 'Filter by Category',
  name: 'Name',
  namePlaceholder: 'General text filter for all names and specifications',
  unit: 'Unit',
  table: {
    scope: 'Scope',
    category: 'Category',
    name: 'Name',
    spec1: 'Specification 1',
    spec2: 'Specification 2',
    spec3: 'Specification 3',
    addName: 'Additional Name',
    inputUnit: 'Input Unit',
    factor: 'Factor',
    outputUnit: 'Output Unit',
    source: 'Source',
    parent: 'Chained',
    parentLong: 'Chained Calculation',
    factorYear: 'Factor (Annual Average)',
  },
  infoBox: {
    heading1: 'Scope 1: Direct Emissions',
    text1:
      'Emissions from owned or controlled sources. Examples: emissions from combustion processes in owned facilities, vehicle emissions',
    heading2: 'Scope 2: Indirect Emissions from Purchased Energy',
    text2:
      'Emissions from the generation of purchased or otherwise acquired electricity, steam, heat, and cooling. Examples: emissions from electricity consumption, district heating',
    heading3: 'Scope 3: Other Indirect Emissions',
    text3:
      "Emissions that do not originate directly from owned or controlled sources but are related to the company's value chain. Examples: emissions from the production of purchased materials and services, transportation and distribution activities, emissions from the disposal of sold products, business travel, employee commuting, leasing activities, investments",
  },
};

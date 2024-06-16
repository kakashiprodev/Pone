interface GenericFormEntryBase {
  label: string;
  key: string;
  required?: boolean;
  tooltip?: string;
  validation?: any; // a valibot validation object
}

interface NumberFormEntry extends GenericFormEntryBase {
  type: 'number';
  settings?: {
    min?: number;
    max?: number;
    thousandSeparator?: boolean;
    suffix?: string;
  };
}

interface TextFormEntry extends GenericFormEntryBase {
  type: 'text';
}

interface DateFormEntry extends GenericFormEntryBase {
  type: 'date';
}

interface TimeFormEntry extends GenericFormEntryBase {
  type: 'time';
}

interface DateTimeFormEntry extends GenericFormEntryBase {
  type: 'datetime';
}

interface TextAreaFormEntry extends GenericFormEntryBase {
  type: 'textarea';
}

interface SelectFormEntry extends GenericFormEntryBase {
  type: 'select';
  options: any[];
  optionsKey: string;
  optionsLabel: string;
}

interface CheckboxFormEntry extends GenericFormEntryBase {
  type: 'checkbox';
}

interface RadioFormEntry extends GenericFormEntryBase {
  type: 'radio';
  options: any[];
  optionsKey: string;
  optionsLabel: string;
}

interface PasswordFormEntry extends GenericFormEntryBase {
  type: 'password';
}

interface SliderFormEntry extends GenericFormEntryBase {
  type: 'slider';
  settings?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

// Union type of all form entries
export type GenericFormEntry =
  | NumberFormEntry
  | TextFormEntry
  | DateFormEntry
  | TimeFormEntry
  | DateTimeFormEntry
  | TextAreaFormEntry
  | SelectFormEntry
  | CheckboxFormEntry
  | RadioFormEntry
  | PasswordFormEntry
  | SliderFormEntry;

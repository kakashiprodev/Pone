export interface GenericFormEntry {
  label: string;
  key: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'password'
    | 'slider';
  options?: any[];
  optionsKey?: string;
  optionsLabel?: string;
  required?: boolean;
  tooltip?: string;
  validation?: any;
}

export interface PropsFilterTable {
  children?: any;
  placeholderInputSearch?: string;
  placeholderTime?: string;
  isTime?: boolean;
  isSearch?: boolean;
  funcAddNew?: () => void;
  funcExportExcel?: () => void;
  keyTypeDate?: string;
  keydateFrom?: string;
  keyDateTo?: string;
}

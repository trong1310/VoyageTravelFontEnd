export interface PropsTable {
  data: any;
  classTable?: string;
  column: {
    title: any;
    render: any;
    className?: string;
    checkBox?: boolean;
    textAlign?: any;
  }[];
  onSetData?: (any: any) => void;
}

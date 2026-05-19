export interface PropsTabNavLink {
  query: string;
  listHref: Array<{
    title: string;
    query: string | null;
    icon?: any;
    count?: string;
  }>;
  outline?: boolean;
  keysToKeep?: string[];
  classMain?: string;
  navNoBorder?: boolean;
}

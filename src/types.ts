export interface ScheduleMember {
  cedula: string;
  nombre: string;
  [key: string]: string; // Support for dynamic columns like Monday, Tuesday, etc.
}

export interface SheetData {
  headers: string[];
  rows: ScheduleMember[];
}

import Papa from 'papaparse';
import { SheetData, ScheduleMember } from '../types';

const SHEET_ID = '14CpQ8myW9NMXPaLl2bvYLh8-EQs7GTsWJhWta480OzM';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const fetchSheetData = async (): Promise<SheetData> => {
  try {
    const response = await fetch(CSV_URL);
    const csvContent = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          
          // Map rows to ensure we find a 'cedula' or equivalent column
          const rows = results.data.map((row: any) => {
            // Find the key that looks like 'cédula' or 'cedula' or 'id'
            const cedulaKey = Object.keys(row).find(k => 
              k.toLowerCase().includes('cédula') || 
              k.toLowerCase().includes('cedula') ||
              k.toLowerCase().includes('id')
            );
            
            const nombreKey = Object.keys(row).find(k => 
              k.toLowerCase().includes('colaborador') || 
              k.toLowerCase().includes('nombre')
            );

            return {
              ...row,
              cedula: cedulaKey ? String(row[cedulaKey]).trim() : '',
              nombre: nombreKey ? String(row[nombreKey]).trim() : 'Colaborador',
            } as ScheduleMember;
          });

          resolve({ headers, rows });
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
};

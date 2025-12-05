import * as XLSX from 'xlsx';

export class FileDataManager {
  private data: number[][] = [];
  private currentIndex: number = 0;
  private columnsPerRow: number = 320;

  constructor(columnsPerRow: number = 320) {
    this.columnsPerRow = columnsPerRow;
  }

  async loadFile(file: File): Promise<void> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      await this.loadCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      await this.loadExcel(file);
    } else {
      throw new Error('Unsupported file format. Please upload CSV or XLSX file.');
    }
  }

  private async loadCSV(file: File): Promise<void> {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.trim()).filter(row => row);
    
    // Check if first row is header (contains non-numeric values)
    const firstRow = rows[0].split(',');
    const hasHeader = firstRow.some(cell => isNaN(parseFloat(cell)));
    
    const dataRows = hasHeader ? rows.slice(1) : rows;
    
    this.data = dataRows.map(row => {
      return row.split(',').map(cell => parseFloat(cell.trim()));
    }).filter(row => row.every(val => !isNaN(val)));
    
    this.currentIndex = 0;
  }

  private async loadExcel(file: File): Promise<void> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
    
    // Check if first row is header
    const firstRow = jsonData[0];
    const hasHeader = firstRow.some(cell => typeof cell === 'string' && isNaN(parseFloat(cell)));
    
    const dataRows = hasHeader ? jsonData.slice(1) : jsonData;
    
    this.data = dataRows.map(row => {
      return row.map(cell => parseFloat(cell));
    }).filter(row => row.length > 0 && row.every(val => !isNaN(val)));
    
    this.currentIndex = 0;
  }

  getNext6Rows(): number[][] | null {
    if (this.data.length === 0) {
      return null;
    }

    // We need exactly 6 rows with columnsPerRow (320) columns each
    const rows: number[][] = [];
    
    for (let i = 0; i < 6; i++) {
      if (this.currentIndex >= this.data.length) {
        this.currentIndex = 0; // Loop back to start
      }
      
      const row = this.data[this.currentIndex];
      
      // Ensure row has exactly columnsPerRow columns
      if (row.length < this.columnsPerRow) {
        // Pad with zeros if needed
        const paddedRow = [...row, ...new Array(this.columnsPerRow - row.length).fill(0)];
        rows.push(paddedRow);
      } else if (row.length > this.columnsPerRow) {
        // Take first columnsPerRow columns
        const trimmedRow = row.slice(0, this.columnsPerRow);
        rows.push(trimmedRow);
      } else {
        rows.push([...row]);
      }
      
      this.currentIndex++;
    }
    
    return rows;
  }

  hasData(): boolean {
    return this.data.length > 0;
  }

  reset(): void {
    this.currentIndex = 0;
  }

  getTotalRows(): number {
    return this.data.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

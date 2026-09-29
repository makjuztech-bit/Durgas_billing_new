import { describe, it, expect } from 'vitest';
import { parseCSV, unparseCSV } from '../lib/csv';

describe('CSV Utility - parseCSV and unparseCSV Edge Cases', () => {
  it('should return an empty array for empty or whitespace-only CSV', () => {
    expect(parseCSV('')).toEqual([]);
    expect(parseCSV('   \n  \r\n  ')).toEqual([]);
  });

  it('should return empty results when only headers are provided', () => {
    const csv = 'Product_Name,Barcode,Price,Stock\n';
    expect(parseCSV(csv)).toEqual([]);
  });

  it('should strip UTF-8 BOM properly if present', () => {
    const csvWithBOM = '\uFEFFProduct_Name,Barcode,Price\nSilk Saree,001234,4500';
    const parsed = parseCSV(csvWithBOM);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]['Product_Name']).toBe('Silk Saree');
    expect(parsed[0]['Barcode']).toBe('001234');
    expect(parsed[0]['Price']).toBe('4500');
  });

  it('should strictly preserve leading zeros in barcodes as strings', () => {
    const csv = 'Product_Name,Barcode,Price\nCotton Dupatta,00049281,250\nZari Shawl,00000001,1200';
    const parsed = parseCSV(csv);
    expect(parsed[0]['Barcode']).toBe('00049281');
    expect(parsed[1]['Barcode']).toBe('00000001');
  });

  it('should handle quoted fields containing commas, quotes, and newlines', () => {
    const csv = `Product_Name,Barcode,Price,Description
"Premium ""Pure"" Kanchipuram, Red",SK-1001,8999,"First line
Second line"
"Simple Cotton",SK-1002,450,"Single line description"`;

    const parsed = parseCSV(csv);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]['Product_Name']).toBe('Premium "Pure" Kanchipuram, Red');
    expect(parsed[0]['Barcode']).toBe('SK-1001');
    expect(parsed[0]['Description']).toBe('First line\nSecond line');
    expect(parsed[1]['Product_Name']).toBe('Simple Cotton');
  });

  it('should handle Windows CRLF (\\r\\n) and Unix LF (\\n) line endings seamlessly', () => {
    const crlf = 'Product_Name,Price\r\nItem 1,100\r\nItem 2,200\r\n';
    const parsed = parseCSV(crlf);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]['Product_Name']).toBe('Item 1');
    expect(parsed[1]['Product_Name']).toBe('Item 2');
  });

  it('unparseCSV should properly quote cells with special characters and commas', () => {
    const data = [
      {
        Product_Name: 'Saree, "Grand" Style',
        Barcode: 'SK-001',
        Price: 2500,
        Stock: 5
      },
      {
        Product_Name: 'Normal Kurti',
        Barcode: 'SK-002',
        Price: 750,
        Stock: 2
      }
    ];

    const csvOutput = unparseCSV(data);
    expect(csvOutput).toContain('"Saree, ""Grand"" Style"');
    expect(csvOutput).toContain('Normal Kurti,SK-002,750,2');

    // Roundtrip verification
    const roundtrip = parseCSV(csvOutput);
    expect(roundtrip).toHaveLength(2);
    expect(roundtrip[0]['Product_Name']).toBe('Saree, "Grand" Style');
    expect(roundtrip[0]['Barcode']).toBe('SK-001');
  });
});

describe('CSV Import Transformation & Edge Cases Logic', () => {
  // Test helper mirroring CSVImportModal's row transformation and validation
  function transformRow(row: Record<string, string>, rowIndex: number) {
    const getVal = (...keys: string[]) => {
      const targetKeys = keys.map((k) => k.toLowerCase().replace(/[\s_-]+/g, ''));
      const exactKey = Object.keys(row).find((k) => {
        const cleanK = k.toLowerCase().replace(/[\s_-]+/g, '');
        return targetKeys.includes(cleanK);
      });
      return exactKey ? row[exactKey]?.trim() : '';
    };

    const name = getVal('product_name', 'name', 'productname');
    let barcode = getVal('barcode', 'code', 'product_code');
    const priceStr = getVal('price', 'selling_price', 'sellingprice', 'rate', 'mrp');
    const stockStr = getVal('stock', 'stock_qty', 'stockqty', 'qty', 'quantity');

    // Excel formula quoting cleanup e.g. ="00123"
    if (barcode && barcode.startsWith('="') && barcode.endsWith('"')) {
      barcode = barcode.substring(2, barcode.length - 1);
    } else if (barcode && barcode.startsWith("'")) {
      barcode = barcode.substring(1);
    }

    if (!name) throw new Error(`Row ${rowIndex + 1}: Product Name is required.`);
    if (!priceStr) throw new Error(`Row ${rowIndex + 1}: Price is required for ${name}.`);
    if (barcode && barcode.toUpperCase().includes('E+')) {
      throw new Error(`Row ${rowIndex + 1}: Barcode contains scientific notation (${barcode}).`);
    }

    return {
      name,
      barcode: barcode || undefined,
      sellingPrice: parseFloat(priceStr) || 0,
      stockQty: stockStr ? parseInt(stockStr, 10) : 1, // Optional stock defaults to 1
      category: getVal('category') || 'General',
      department: getVal('department') || 'Womens'
    };
  }

  it('should default stock to 1 when Stock is missing or empty', () => {
    const row = {
      Product_Name: 'Bridal Saree',
      Price: '3500'
    };
    const transformed = transformRow(row, 0);
    expect(transformed.stockQty).toBe(1);
    expect(transformed.barcode).toBeUndefined();
    expect(transformed.category).toBe('General');
  });

  it('should respect custom stock when provided', () => {
    const row = {
      Product_Name: 'Silk Scarf',
      Price: '450',
      Stock: '15'
    };
    const transformed = transformRow(row, 0);
    expect(transformed.stockQty).toBe(15);
  });

  it('should clean Excel formula wrapper ="0012345" to exact string "0012345"', () => {
    const row = {
      Product_Name: 'Banarasi Saree',
      Barcode: '="0012345"',
      Price: '7500'
    };
    const transformed = transformRow(row, 0);
    expect(transformed.barcode).toBe('0012345');
  });

  it('should throw an explicit error when Barcode contains scientific notation (E+)', () => {
    const row = {
      Product_Name: 'Designer Saree',
      Barcode: '8.90123E+12',
      Price: '1200'
    };
    expect(() => transformRow(row, 0)).toThrow(/scientific notation/);
  });

  it('should throw error when Product Name or Price is missing', () => {
    expect(() => transformRow({ Price: '100' }, 0)).toThrow(/Product Name is required/);
    expect(() => transformRow({ Product_Name: 'Test Item' }, 0)).toThrow(/Price is required/);
  });

  it('should handle case-insensitive and alternative column headers', () => {
    const row1 = { productname: 'Item A', selling_price: '500', qty: '8' };
    const res1 = transformRow(row1, 0);
    expect(res1.name).toBe('Item A');
    expect(res1.sellingPrice).toBe(500);
    expect(res1.stockQty).toBe(8);

    const row2 = { 'PRODUCT NAME': 'Item B', PRICE: '1500', stockqty: '20' };
    const res2 = transformRow(row2, 1);
    expect(res2.name).toBe('Item B');
    expect(res2.sellingPrice).toBe(1500);
    expect(res2.stockQty).toBe(20);
  });
});

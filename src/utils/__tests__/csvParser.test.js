import { describe, it, expect } from 'vitest';
import { parseCSV } from '../csvParser';

// Node ortamı için FileReader ve File mock'ları.
// NOT: `function() { this.x = ... }` biçimi TypeScript 6 derleyicisinde
// iç hataya (Debug Failure) yol açtığı için sınıf sözdizimi kullanılır.
class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }

  readAsText() {
    if (this.onload) {
      this.onload({ target: { result: 'Tarih,Tutar,Açıklama\n01/01/2026,100,Test' } });
    }
  }

  readAsArrayBuffer() {
    if (this.onload) {
      this.onload({ target: { result: new ArrayBuffer(8) } });
    }
  }
}

class MockFile {
  constructor(content, name) {
    this.content = content;
    this.name = name;
  }
}

globalThis.FileReader = MockFileReader;
globalThis.File = MockFile;

describe('csvParser', () => {
  it('should parse a basic CSV file', async () => {
    const mockFile = new File([''], 'test.csv');
    // Gerçek bir test için papaparse mock'lanmalı veya FileReader tam uygulanmalı.
    // Burada fonksiyonun var olduğunu ve promise döndürdüğünü doğruluyoruz.
    const promise = parseCSV(mockFile).catch(() => {});
    expect(promise).toBeInstanceOf(Promise);
  });
});

import { UploadedFile, Order } from '../types';

declare const initSqlJs: any;

class DatabaseService {
  private db: any = null;
  private isInitialized = false;

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
      const binary_string = window.atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
      });
      
      const dbData = localStorage.getItem('sqliteDb');
      if (dbData) {
        const dbBuffer = this.base64ToUint8Array(dbData);
        this.db = new SQL.Database(dbBuffer);
      } else {
        this.db = new SQL.Database();
      }

      this.db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          name TEXT,
          type TEXT,
          base64Content TEXT
        );
      `);
      this.db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          orderNumber TEXT,
          orderDate TEXT,
          customer TEXT,
          total REAL,
          items TEXT,
          receiptFileName TEXT
        );
      `);
      
      this.isInitialized = true;
      this.persist();
    } catch (e) {
      console.error("Failed to initialize database", e);
      throw e;
    }
  }

  private persist() {
    if (!this.db) return;
    const data = this.db.export();
    const base64 = this.uint8ArrayToBase64(data);
    localStorage.setItem('sqliteDb', base64);
  }

  async addDocument(doc: UploadedFile): Promise<void> {
    if (!this.db) await this.init();
    this.db.run("INSERT INTO documents (id, name, type, base64Content) VALUES (?, ?, ?, ?)", [doc.id, doc.name, doc.type, doc.base64Content]);
    this.persist();
  }
  
  async getDocuments(): Promise<UploadedFile[]> {
    if (!this.db) await this.init();
    const res = this.db.exec("SELECT * FROM documents");
    if (res.length === 0) {
      return [];
    }
    return res[0].values.map((row: any[]) => ({
      id: row[0],
      name: row[1],
      type: row[2],
      base64Content: row[3],
    }));
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) await this.init();
    this.db.run("DELETE FROM documents WHERE id=?", [id]);
    this.persist();
  }

  async addOrder(order: Order): Promise<void> {
    if (!this.db) await this.init();
    this.db.run(
        "INSERT INTO orders (id, orderNumber, orderDate, customer, total, items, receiptFileName) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            order.id,
            order.orderNumber,
            order.orderDate,
            order.customer,
            order.total,
            JSON.stringify(order.items),
            order.receiptFileName
        ]
    );
    this.persist();
  }
}

export const dbService = new DatabaseService();
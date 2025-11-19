import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../db.sqlite3');

// Enable verbose mode for debugging
const sqlite = sqlite3.verbose();

// Create database connection
export const db = new sqlite.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
    }
});

// Helper function to run queries with promises
export const runQuery = (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

// Helper function to get single row
export const getOne = (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Helper function to get all rows
export const getAll = (sql: string, params: any[] = []): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Initialize database with schema
export const initializeDatabase = async (): Promise<void> => {
    const schemaPath = path.join(__dirname, '../setup/01-create-tables.sql');
    
    if (!fs.existsSync(schemaPath)) {
        console.error('Schema file not found:', schemaPath);
        return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
        if (statement.trim()) {
            try {
                await runQuery(statement);
            } catch (err) {
                console.error('Error executing statement:', err);
            }
        }
    }

    console.log('Database initialized successfully');
};
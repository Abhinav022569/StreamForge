import sqlite3
import os

DB_PATH = 'pipelines.db'

def migrate():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 1. Add columns to 'data_source' table
    columns_to_add_datasource = [
        ("row_count", "INTEGER DEFAULT 0"),
        ("columns", "TEXT")
    ]
    
    print("Migrating 'data_source' table...")
    for col_name, col_type in columns_to_add_datasource:
        try:
            c.execute(f"ALTER TABLE data_source ADD COLUMN {col_name} {col_type}")
            print(f" - Added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print(f" - Column {col_name} already exists.")
            else:
                print(f" - Error adding {col_name}: {e}")

    # 2. Add columns to 'processed_file' table
    columns_to_add_processed = [
        ("row_count", "INTEGER DEFAULT 0"),
        ("columns", "TEXT"),
        ("source_pipeline_id", "INTEGER REFERENCES pipeline(id)")
    ]
    
    print("Migrating 'processed_file' table...")
    for col_name, col_type in columns_to_add_processed:
        try:
            c.execute(f"ALTER TABLE processed_file ADD COLUMN {col_name} {col_type}")
            print(f" - Added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print(f" - Column {col_name} already exists.")
            else:
                print(f" - Error adding {col_name}: {e}")

    conn.commit()
    conn.close()
    print("\n✅ Migration completed successfully! You can now run 'python run.py'.")

if __name__ == "__main__":
    if os.path.exists(DB_PATH):
        migrate()
    else:
        print(f"❌ {DB_PATH} not found. Please run the app once to generate the database file first.")
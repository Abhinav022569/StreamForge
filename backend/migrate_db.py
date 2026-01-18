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

    # 3. Add columns to 'user' table
    columns_to_add_user = [
        ("notify_on_success", "BOOLEAN DEFAULT 1"),
        ("notify_on_failure", "BOOLEAN DEFAULT 1")
    ]
    
    print("Migrating 'user' table...")
    for col_name, col_type in columns_to_add_user:
        try:
            c.execute(f"ALTER TABLE user ADD COLUMN {col_name} {col_type}")
            print(f" - Added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print(f" - Column {col_name} already exists.")
            else:
                print(f" - Error adding {col_name}: {e}")
                
    # 4. Create Notification Table if not exists
    print("Creating 'notification' table...")
    c.execute('''
        CREATE TABLE IF NOT EXISTS notification (
            id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            message VARCHAR(500),
            type VARCHAR(20),
            read BOOLEAN DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES user(id)
        )
    ''')

    conn.commit()
    conn.close()
    print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    if os.path.exists(DB_PATH):
        migrate()
    else:
        print(f"❌ {DB_PATH} not found.")
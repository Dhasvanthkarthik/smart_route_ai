import sqlite3

conn = sqlite3.connect('logistics.db')
cursor = conn.cursor()
try:
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    print("Users:")
    for row in rows:
        print(row)
except Exception as e:
    print(f"Error: {e}")

try:
    cursor.execute("SELECT * FROM opaque_tokens")
    rows = cursor.fetchall()
    print("\nTokens:")
    for row in rows:
        print(row)
except Exception as e:
    print(f"Error: {e}")

conn.close()

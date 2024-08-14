import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Define connection parameters for source and destination databases
source_conn_params = {
    'dbname': os.getenv('SOURCE_DB_DATABASE'),
    'user': os.getenv('SOURCE_DB_USER'),
    'password': os.getenv('SOURCE_DB_PASSWORD'),
    'host': os.getenv('SOURCE_DB_HOST'),
    'port': os.getenv('SOURCE_DB_PORT'),
}

destination_conn_params = {
    'dbname': os.getenv('DESTINATION_DB_DATABASE'),
    'user': os.getenv('DESTINATION_DB_USER'),
    'password': os.getenv('DESTINATION_DB_PASSWORD'),
    'host': os.getenv('DESTINATION_DB_HOST'),
    'port': os.getenv('DESTINATION_DB_PORT'),
    'sslmode': 'require'
}

# List of tables to copy
tables_to_copy = ['media',
                  'projects', 
                  'sites', 
                  'reports',
                  'users',
                  'user_projects',
                  'targets',
                  'actions',
                  'csrdtopics',
                  'equivalents',
                  'facilities',
                  'inputs',
                  ]

def copy_table_data(source_conn, destination_conn, table_name):
    # Open a cursor to perform database operations
    source_cursor = source_conn.cursor()
    destination_cursor = destination_conn.cursor()

    try:
        # Truncate the destination table
        destination_cursor.execute(sql.SQL("DELETE FROM {}").format(sql.Identifier(table_name)))
        destination_conn.commit()

        print(f"Deleted data from table {table_name} in the destination database.")

        # Fetch all data from the source table
        rows = []
        if table_name == 'equivalents':
            # order by "parent" that nulls are first
            source_cursor.execute(sql.SQL("SELECT * FROM {} ORDER BY parent DESC").format(sql.Identifier(table_name)))
            rows = source_cursor.fetchall()
        else:
            source_cursor.execute(sql.SQL("SELECT * FROM {}").format(sql.Identifier(table_name)))
            rows = source_cursor.fetchall()        

        # Get the column names from the source table
        colnames = [desc[0] for desc in source_cursor.description]

        # Construct the INSERT statement for the destination table
        insert_statement = sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
            sql.Identifier(table_name),
            sql.SQL(', ').join(map(sql.Identifier, colnames)),
            sql.SQL(', ').join(sql.Placeholder() * len(colnames))
        )

        # Insert data into the destination table
        destination_cursor.executemany(insert_statement, rows)

        # Commit the transaction
        destination_conn.commit()

        print(f"Copied data from {table_name} successfully.")

    except Exception as e:
        # Rollback in case of error
        destination_conn.rollback()
        print(f"Error copying data from {table_name}: {e}")

    finally:
        # Close cursors
        source_cursor.close()
        destination_cursor.close()

def main():
    # Connect to the source and destination databases
    source_conn = psycopg2.connect(**source_conn_params, options="-c search_path=data")
    destination_conn = psycopg2.connect(**destination_conn_params, options="-c search_path=data")

    try:
        # Copy data for each table in the list
        for table in tables_to_copy:
            copy_table_data(source_conn, destination_conn, table)

    finally:
        # Close the database connections
        source_conn.close()
        destination_conn.close()

if __name__ == "__main__":
    main()

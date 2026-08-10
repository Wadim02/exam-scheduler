import os
import pandas as pd

from sqlalchemy import create_engine, text
from dotenv import load_dotenv


# ---------------------------------------------------------
# Environment configuration
# ---------------------------------------------------------

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:ad12min34@localhost:5432/exam_scheduler"
)

engine = create_engine(DATABASE_URL)


# ---------------------------------------------------------
# Database cleanup
# ---------------------------------------------------------

print("Clearing existing database data...")

with engine.begin() as conn:
    conn.execute(
        text(
            """
            TRUNCATE TABLE
                exam_proposals,
                exam_limits,
                subjects,
                group_leaders,
                subgroups,
                professors,
                rooms,
                faculties,
                admins,
                secretariat
            RESTART IDENTITY CASCADE;
            """
        )
    )

print("Database tables cleared successfully.")


# ---------------------------------------------------------
# Allowed columns for each table
# ---------------------------------------------------------

TABLE_COLUMNS = {
    "faculties": [
        "id",
        "shortName",
        "longName",
    ],

    "rooms": [
        "id",
        "name",
        "shortName",
        "buildingName",
    ],

    "subgroups": [
        "id",
        "facultyId",
        "studyYear",
        "groupName",
        "subgroupIndex",
    ],

    "professors": [
        "id",
        "lastName",
        "firstName",
        "emailAddress",
        "phoneNumber",
        "facultyName",
        "departmentName",
    ],

    "group_leaders": [
        "id",
        "lastName",
        "firstName",
        "emailAddress",
        "phoneNumber",
        "faculty_id",
        "subgroup_id",
    ],

    "admins": [
        "id",
        "lastName",
        "firstName",
        "emailAddress",
        "phoneNumber",
        "facultyName",
        "departmentName",
    ],

    "secretariat": [
        "id",
        "lastName",
        "firstName",
        "emailAddress",
        "phoneNumber",
        "facultyName",
        "departmentName",
    ],

    "subjects": [
        "id",
        "professor_id",
        "subgroup_id",
        "topic",
    ],

    "exam_limits": [
        "id",
        "start_date",
        "end_date",
    ],

    "exam_proposals": [
        "id",
        "subject_id",
        "group_leader_id",
        "room_id",
        "date",
        "duration",
        "status",
        "rejection_reason",
        "assistant_id",
    ],
}


# ---------------------------------------------------------
# Date columns
# ---------------------------------------------------------

DATETIME_COLUMNS = {
    "exam_limits": [
        "start_date",
        "end_date",
    ],

    "exam_proposals": [
        "date",
    ],
}


# ---------------------------------------------------------
# CSV import function
# ---------------------------------------------------------

def safe_import_csv(relative_file_path, table_name):
    """
    Import a CSV file into the specified database table.

    Only columns defined in TABLE_COLUMNS are imported.
    Missing CSV files are skipped without stopping the
    entire database initialization process.
    """

    try:
        file_path = os.path.join(BASE_DIR, relative_file_path)

        if not os.path.exists(file_path):
            print(f"[SKIPPED] File not found: {relative_file_path}")
            return

        valid_columns = TABLE_COLUMNS[table_name]

        dataframe = pd.read_csv(
            file_path,
            usecols=lambda column: column in valid_columns
        )

        # Convert date columns to datetime objects
        for column in DATETIME_COLUMNS.get(table_name, []):
            if column in dataframe.columns:
                dataframe[column] = pd.to_datetime(
                    dataframe[column],
                    errors="coerce"
                )

        dataframe.to_sql(
            table_name,
            engine,
            index=False,
            if_exists="append"
        )

        print(
            f"[OK] Imported {table_name}: "
            f"{len(dataframe)} row(s)"
        )

    except Exception as error:
        print(
            f"[ERROR] Could not import "
            f"{relative_file_path} -> {table_name}: {error}"
        )


# ---------------------------------------------------------
# CSV files and target database tables
# ---------------------------------------------------------

IMPORT_LIST = [
    ("csv_output/faculties.csv", "faculties"),
    ("csv_output/rooms.csv", "rooms"),
    ("csv_output/subgroups.csv", "subgroups"),

    ("csv_output/professors.csv", "professors"),
    ("csv_output/group_leaders.csv", "group_leaders"),
    ("csv_output/admins.csv", "admins"),
    ("csv_output/secretariat.csv", "secretariat"),

    ("csv_output/subjects.csv", "subjects"),

    ("csv_output/exam_limits.csv", "exam_limits"),
    ("csv_output/exam_proposals.csv", "exam_proposals"),
]


# ---------------------------------------------------------
# Execute CSV imports
# ---------------------------------------------------------

print("\nStarting CSV imports...")

for file_path, table_name in IMPORT_LIST:
    safe_import_csv(file_path, table_name)

print("\nCSV import process completed.")


# ---------------------------------------------------------
# Synchronize PostgreSQL ID sequences
# ---------------------------------------------------------

TABLES_WITH_ID = [
    "faculties",
    "rooms",
    "subgroups",
    "professors",
    "group_leaders",
    "admins",
    "secretariat",
    "subjects",
    "exam_limits",
    "exam_proposals",
]


def synchronize_sequences():
    """
    Synchronize PostgreSQL ID sequences after importing
    rows that contain explicit ID values from CSV files.
    """

    print("\nSynchronizing database ID sequences...")

    with engine.begin() as conn:
        for table_name in TABLES_WITH_ID:
            conn.execute(
                text(
                    f"""
                    SELECT setval(
                        pg_get_serial_sequence(
                            '{table_name}',
                            'id'
                        ),
                        COALESCE(
                            (SELECT MAX(id) FROM {table_name}),
                            1
                        ),
                        EXISTS(
                            SELECT 1 FROM {table_name}
                        )
                    );
                    """
                )
            )

    print("Database ID sequences synchronized.")


synchronize_sequences()

print("\nDatabase initialization completed successfully.")
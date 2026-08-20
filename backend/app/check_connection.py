from sqlalchemy import text
from database import engine


with engine.connect() as connection:

    result = connection.execute(
        text(
            "SELECT current_database(), current_schema(), "
            "inet_server_addr(), inet_server_port()"
        )
    )

    print("DATABASE CONNECTION:")
    print(result.fetchone())

    result = connection.execute(
        text(
            "SELECT column_name "
            "FROM information_schema.columns "
            "WHERE table_name = 'users' "
            "ORDER BY ordinal_position"
        )
    )

    print("\nUSERS TABLE COLUMNS:")

    for row in result:
        print(row[0])
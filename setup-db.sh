#!/bin/bash
environment=$1

if [ $SECONDARY = "true" ]; then
    echo "sleeping to await db init
    "
    sleep 10
else


    echo "Testing if postgres is running"
    if psql -h $DB_HOST -U $DB_USERNAME -c 'select 1+1 as result' ; then
        echo "Postgres is running ✅"
    else
        echo "Postgres not found ❌"
        exit 1
    fi

    echo "Setting environment"
    if [ $environment = "prod" ]; then
        dbname=$DB_NAME_PROD
        echo "Environment Prod ✅"
    elif [ $environment = "dev" ]; then
        dbname=$DB_NAME_DEV
        echo "Environment Dev ✅"
    elif [ $environment = "test" ]; then
        dbname=$DB_NAME_TEST
        echo "Environment Test ✅"
    else
        echo "Environment > ${environment} < not known ❌"
        exit 1
    fi

    if [ $environment = "test" ]; then
        echo "Dropping test database"
            dropdb -h $DB_HOST -U $DB_USERNAME "$dbname" --if-exists
        echo "Dropped test database ✅"
    fi

    echo "Checking for database"
    if psql -lqt -h $DB_HOST -U $DB_USERNAME | cut -d \| -f 1 | grep -qw $dbname; then
        echo "Database exists ✅"
    else
        echo "Creating Database"
        createdb -h $DB_HOST -U $DB_USERNAME "$dbname"
        echo "Created Database ✅"
    fi

    echo "Creating table structure"
    npx knex --env $environment migrate:latest
    echo "Created table structure ✅"

    echo "Seeding database"
    npx knex --env $environment seed:run
    echo "Seeded database ✅"
fi

exit 0
















package utils

import (
	"database/sql"
	"log"
)

var DB *sql.DB

func ConnectDB() {
	var err error
	// Update the connection string with your database credentials
	DB, err = sql.Open("postgres", "user=youruser password=yourpassword dbname=yourdbname sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("Database is not reachable:", err)
	}

	log.Println("Connected to the database successfully")
}

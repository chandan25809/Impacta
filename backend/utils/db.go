package utils

import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "log"
)

var DB *gorm.DB

func ConnectDB() {
    var err error

    // Update this connection string with your database credentials
    dsn := "host=host.docker.internal user=impacta_user password=impacta dbname=impacta port=5432 sslmode=disable TimeZone=Asia/Kolkata"

    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to the database:", err)
    }

    log.Println("Database connected successfully")
}


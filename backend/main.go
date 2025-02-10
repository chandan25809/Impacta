package main

import (
	"log"
    "backend/routes"
	"backend/utils"
    // "backend/db/migrate"
)

func main() {
	// Connect to the database
	utils.ConnectDB()

    // Run database migrations
    // migrate.RunMigrations()


	// Print a startup message
	log.Println("Starting Impacta Backend...")

	// Setup the router
	router := routes.SetupRouter()

	// Start the server
	log.Println("Server is running on http://localhost:8080")
	log.Fatal(router.Run(":8080"))
}

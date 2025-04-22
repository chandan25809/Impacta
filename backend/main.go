package main

import (
	"log"

	"backend/routes"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// Connect to the database
	utils.ConnectDB()

	// Init Prometheus metrics
	utils.InitMetrics()

	// Uncomment if you want to run database migrations
	// migrate.RunMigrations()

	// Print a startup message
	log.Println("Starting Impacta Backend...")

	// Setup the router (assumes you're using Gin)
	router := routes.SetupRouter()

	// Add a /metrics endpoint to expose Prometheus metrics.
	// Using gin.WrapH to wrap the promhttp.Handler() so it works with Gin.
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Start the server
	log.Println("Server is running on http://localhost:8080")
	log.Fatal(router.Run(":8080"))
}

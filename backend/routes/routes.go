package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Public routes
	r.POST("/register", controllers.RegisterUser)
	r.POST("/login", controllers.LoginUser)

	// Campaigns (Public Access)
	r.GET("/campaigns", controllers.ListCampaigns)     // List all campaigns
	r.GET("/campaigns/:id", controllers.GetCampaign)   // Get a single campaign


	// Donations (Public Access)
	r.POST("/donations", controllers.MakeDonation)     // Make a donation
	r.GET("/campaigns/:id/donations", controllers.ListCampaignDonations) 


	// Protected routes
	protected := r.Group("/")
	protected.Use(middlewares.JWTAuthMiddleware())


	protected.POST("/refresh-token", controllers.RefreshToken) // Refresh JWT token


	// Users
	protected.GET("/user", controllers.GetUser)        // Get user details
	protected.PUT("/user", controllers.UpdateUser)     // Update user
	protected.DELETE("/user", controllers.DeleteUser)  // Delete user
	protected.GET("/users", controllers.GetAllUsers) // Only for admin


	// Campaigns (Protected Access for creation, updates, and deletion)
	protected.POST("/campaigns", controllers.CreateCampaign)         // Create a campaign
	protected.PUT("/campaigns/:id", controllers.UpdateCampaign)      // Update a campaign
	protected.DELETE("/campaigns/:id", controllers.DeleteCampaign)   // Delete a campaign

	// Donations
	protected.GET("/user/donations", controllers.ListUserDonations) // List user's donations
	protected.PUT("/donations/:id", controllers.UpdateDonation) // Admin-only route to update donation



	return r
}
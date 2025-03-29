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
	r.GET("/campaigns", controllers.ListCampaigns)          // List all campaigns
	r.GET("/campaigns/detail/:id", controllers.GetCampaign) // Get a single campaign (updated URL)

	// Donations (Public Access)
	r.POST("/donations", controllers.MakeDonation) // Make a donation
	r.GET("/campaigns/detail/:id/donations", controllers.ListCampaignDonations)

	// Media Files (Public Access)
	r.GET("/campaigns/:campaign_id/mediafiles", controllers.ListMediaFilesByCampaignID)
	r.GET("/users/:user_id/mediafiles", controllers.ListMediaFilesByUserID)
	r.GET("/mediafiles/:id", controllers.GetMediaFile)

	// Comments (Public Access)
	r.GET("/comments/:id", controllers.GetComment)
	r.GET("/campaigns/:campaign_id/comments", controllers.ListCommentsByCampaignID)
	r.GET("/users/:user_id/comments", controllers.ListCommentsByUserID)

	// Protected routes
	protected := r.Group("/")
	protected.Use(middlewares.JWTAuthMiddleware())

	protected.POST("/refresh-token", controllers.RefreshToken) // Refresh JWT token

	// Users
	protected.GET("/user", controllers.GetUser)       // Get user details
	protected.PUT("/user", controllers.UpdateUser)    // Update user
	protected.DELETE("/user", controllers.DeleteUser) // Delete user
	protected.GET("/users", controllers.GetAllUsers)  // Only for admin

	// Campaigns (Protected Access for creation, updates, and deletion)
	protected.POST("/campaigns", controllers.CreateCampaign)              // Create a campaign
	protected.PUT("/campaigns/detail/:id", controllers.UpdateCampaign)    // Update a campaign
	protected.DELETE("/campaigns/detail/:id", controllers.DeleteCampaign) // Delete a campaign

	// Donations (Protected)
	protected.GET("/user/donations", controllers.ListUserDonations) // List user's donations
	protected.PUT("/donations/:id", controllers.UpdateDonation)     // Admin-only route to update donation

	// MediaFiles Protected routes: creation and bulk deletion
	protected.POST("/mediafiles", controllers.CreateMediaFile)
	protected.DELETE("/mediafiles/bulk", controllers.BulkDeleteMediaFiles)

	// Comments Protected routes: creation, update and deletion
	protected.PUT("/comments/:id", controllers.UpdateComment)
	protected.DELETE("/comments/:id", controllers.DeleteComment)
	protected.POST("/comments", controllers.CreateComment)

	// Notifications Protected routes
	protected.POST("/notifications", controllers.CreateNotification)
	protected.GET("/notifications/:id", controllers.GetNotificationByID)
	protected.GET("/notifications", controllers.ListNotificationsByUser)
	protected.PUT("/notifications/:id", controllers.UpdateNotificationByID)
	protected.DELETE("/notifications/bulk", controllers.BulkDeleteNotifications)

	// Support Tickets Protected routes
	protected.POST("/support-tickets", controllers.CreateSupportTicket)
	protected.GET("/support-tickets/:id", controllers.GetSupportTicketByID)
	protected.GET("/support-tickets", controllers.ListSupportTickets)
	protected.PUT("/support-tickets/:id", controllers.UpdateSupportTicketByID)
	protected.DELETE("/support-tickets/bulk", controllers.BulkDeleteSupportTickets)

	// Payment Transactions Protected routes (admin-only for update and bulk deletion)
	protected.POST("/paymenttransactions", controllers.CreatePaymentTransaction)             // Create Payment Transaction
	protected.GET("/paymenttransactions/:id", controllers.GetPaymentTransactionByID)         // Get by ID
	protected.GET("/paymenttransactions", controllers.ListPaymentTransactions)               // List transactions, optional filter by donation_id
	protected.PUT("/paymenttransactions/:id", controllers.UpdatePaymentTransaction)          // Admin-only update
	protected.DELETE("/paymenttransactions/bulk", controllers.BulkDeletePaymentTransactions) // Admin-only bulk delete

	return r
}

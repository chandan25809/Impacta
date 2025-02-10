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

	// Protected routes
	protected := r.Group("/")
	protected.Use(middlewares.JWTAuthMiddleware())

	protected.POST("/refresh-token", controllers.RefreshToken) // Refresh JWT token

	// Users
	protected.GET("/user", controllers.GetUser)       // Get user details
	protected.PUT("/user", controllers.UpdateUser)    // Update user
	protected.DELETE("/user", controllers.DeleteUser) // Delete user
	protected.GET("/users", controllers.GetAllUsers)  // Only for admin

	return r
}

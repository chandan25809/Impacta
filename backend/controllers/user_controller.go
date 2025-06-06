package controllers

import (
	"fmt"
	"log"
	"strings"

	// "time"
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"

	// "github.com/google/uuid"
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const welcomeEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to Impacta</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse!important; }
    body { margin:0!important; padding:0!important; width:100%!important;
           font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
           background-color:#f4f4f4; color:#333; }
    a { color:#1a73e8; text-decoration:none; }
    .email-container { max-width:600px; margin:auto; background:#fff;
                       border-radius:8px; overflow:hidden; }
    .header { background:#1a73e8; padding:20px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:28px; letter-spacing:1px; }
    .content { padding:30px; }
    .content h2 { margin:0 0 16px; font-size:24px; color:#333; }
    .content p { margin:0 0 16px; line-height:1.6; }
    .features { list-style:none; padding:0; margin:20px 0; }
    .features li { margin-bottom:10px; padding-left:20px; position:relative; }
    .features li:before { content:'✔'; position:absolute; left:0; color:#1a73e8; }
    .btn { display:inline-block; padding:12px 24px; background:#1a73e8;
           color:#fff!important; border-radius:4px; font-weight:bold; }
    .footer { background:#f4f4f4; padding:20px; text-align:center;
              font-size:12px; color:#777; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <div class="email-container">
        <div class="header">
          <h1>Impacta</h1>
        </div>
        <div class="content">
          <h2>Welcome aboard, {{.Name}}!</h2>
          <p>Thank you for signing up for <strong>Impacta</strong> – your new home for creating and supporting impactful campaigns.</p>
          <p>Here’s what you can do next:</p>
          <ul class="features">
            <li><strong>Launch a Campaign:</strong> Share your story and goals with the world.</li>
            <li><strong>Discover Causes:</strong> Browse and support campaigns that matter.</li>
            <li><strong>Track Impact:</strong> See real‑time updates on contributions and goals.</li>
          </ul>
          <p style="text-align:center;">
            <a href="https://yourapp.com/dashboard" class="btn">Go to Your Dashboard</a>
          </p>
          <p>If you have questions or need help, just reply to this email—we’re here for you!</p>
          <p>Cheers,<br>The Impacta Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Impacta Inc. All rights reserved.</p>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`

func RegisterUser(c *gin.Context) {
	// Temporary struct for input binding
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password,omitempty"` // No "required" tag
		FullName string `json:"full_name" binding:"required"`
		Role     string `json:"role,omitempty"` // Optional; defaults to "donor"
	}

	// Bind the input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default the role if not provided
	if input.Role == "" {
		input.Role = "campaign_creator"
	}

	// Validate the role
	allowedRoles := map[string]bool{"donor": true, "campaign_creator": true}
	if !allowedRoles[input.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	// Check if a user with the given email already exists
	var existingUser models.User
	err := utils.DB.Where("email = ?", input.Email).First(&existingUser).Error
	if err == nil {
		// User already exists. Return a token for this user.
		token, tokenErr := utils.GenerateToken(existingUser.ID.String(), existingUser.Email, existingUser.Role)
		if tokenErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "User already registered. Returning existing token.",
			"token":   token,
		})
		return
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		// Some other database error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check user existence"})
		return
	}

	// No existing user found; proceed with creating a new one
	var hashedPassword string
	if input.Role != "donor" {
		if input.Password == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password is required for non-donor roles"})
			return
		}

		// Hash the password
		hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		hashedPassword = string(hashed)
	}

	// Create the user record
	user := models.User{
		Email:        input.Email,
		PasswordHash: hashedPassword, // Empty if the role is "donor"
		FullName:     input.FullName,
		Role:         input.Role,
		Status:       "active", // Default status
	}

	// Save the user to the database
	if err := utils.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate a token for the newly registered user
	token, err := utils.GenerateToken(user.ID.String(), user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// **SEND WELCOME EMAIL ASYNC**
	// send the welcome email asynchronously
	go func(to, name string) {
		subject := fmt.Sprintf("🎉 Welcome to Impacta, %s!", name)
		body := strings.ReplaceAll(welcomeEmailTemplate, "{{.Name}}", name)
		if err := utils.SendEmail(to, subject, body); err != nil {
			log.Printf("error sending welcome email to %s: %v", to, err)
		}
	}(user.Email, user.FullName)

	// Respond with success
	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"token":   token,
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"full_name":  user.FullName,
			"role":       user.Role,
			"status":     user.Status,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
}

// Login a user and return a JWT token
func LoginUser(c *gin.Context) {
	log.Println("LoginUser handler called") // Debug log

	var loginDetails struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&loginDetails); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Println("Login payload:", loginDetails) // Debug log

	var user models.User
	if err := utils.DB.Where("email = ?", loginDetails.Email).First(&user).Error; err != nil {
		log.Println("User not found for email:", loginDetails.Email) // Debug log
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	log.Println("Stored hashed password:", user.PasswordHash)           // Debug log
	log.Println("Plaintext password from user:", loginDetails.Password) // Debug log

	// Compare the password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(loginDetails.Password)); err != nil {
		log.Println("Password comparison failed:", err) // Debug log
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID.String(), user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	log.Println("Token generated for user:", token) // Debug log
	c.JSON(http.StatusOK, gin.H{"token": token})
}

// Get user details (protected route)
func GetUser(c *gin.Context) {
	// Retrieve claims from the context
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Type assertion to convert the claims to your custom Claims type
	userClaims, ok := claims.(*utils.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Fetch the user using the ID from the claims
	var user models.User
	if err := utils.DB.Where("id = ?", userClaims.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Return the user details (omit sensitive fields)
	// Return the user details (omit sensitive fields)
	// response := struct {
	// 	ID        string    `json:"id"`
	// 	Email     string    `json:"email"`
	// 	FullName  string    `json:"full_name"`
	// 	Role      string    `json:"role"`
	// 	Status    string    `json:"status"`
	// 	CreatedAt time.Time `json:"created_at"`
	// 	UpdatedAt time.Time `json:"updated_at"`
	// }{
	// 	ID:        user.ID.String(),
	// 	Email:     user.Email,
	// 	FullName:  user.FullName,
	// 	Role:      user.Role,
	// 	Status:    user.Status,
	// 	CreatedAt: user.CreatedAt,
	// 	UpdatedAt: user.UpdatedAt,
	// }

	// c.JSON(http.StatusOK, response)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"full_name":  user.FullName,
			"role":       user.Role,
			"status":     user.Status,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
}

func UpdateUser(c *gin.Context) {
	// Retrieve claims from the context
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userClaims, ok := claims.(*utils.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Bind the input fields
	var input struct {
		FullName string `json:"full_name,omitempty"`
		Role     string `json:"role,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate role
	allowedRoles := map[string]bool{"donor": true, "campaign_creator": true}
	if input.Role != "" && !allowedRoles[input.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	// Fetch the user using the ID from the claims
	var user models.User
	if err := utils.DB.Where("id = ?", userClaims.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update the user fields
	if input.FullName != "" {
		user.FullName = input.FullName
	}
	if input.Role != "" {
		user.Role = input.Role
	}

	// Save the updated user to the database
	if err := utils.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"full_name":  user.FullName,
			"role":       user.Role,
			"status":     user.Status,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
}

func DeleteUser(c *gin.Context) {
	// Retrieve claims from the context
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userClaims, ok := claims.(*utils.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Fetch the user using the ID from the claims
	var user models.User
	if err := utils.DB.Where("id = ?", userClaims.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Delete the user record from the database
	if err := utils.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted successfully",
	})
}

func GetAllUsers(c *gin.Context) {
	// Retrieve claims from the context
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Type assertion to get the Claims struct
	userClaims, ok := claims.(*utils.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}
	log.Println("User Role:", userClaims.Role)
	// Check if the user is an admin
	if userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Fetch all users from the database
	var users []models.User
	if err := utils.DB.Select("id, email, full_name, role, status, created_at, updated_at").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Return the list of users
	c.JSON(http.StatusOK, gin.H{"users": users})
}

func RefreshToken(c *gin.Context) {
	// Retrieve claims from the context
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userClaims, ok := claims.(*utils.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Fetch the latest user information from the database
	var user models.User
	if err := utils.DB.Where("id = ?", userClaims.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Generate a new token with the updated role
	token, err := utils.GenerateToken(user.ID.String(), user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

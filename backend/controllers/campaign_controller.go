package controllers

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const campaignCreatedEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Campaign Created</title>
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
    .details { background:#f9f9f9; padding:16px; border-radius:4px; }
    .details dt { font-weight:bold; margin-top:8px; }
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
          <h2>Congratulations, {{.CreatorName}}!</h2>
          <p>Your new campaign has just been created successfully. Here are the details:</p>
          <dl class="details">
            <dt>Title:</dt><dd>{{.Title}}</dd>
            <dt>Goal:</dt><dd>{{.TargetAmount}} {{.Currency}}</dd>
            <dt>Deadline:</dt><dd>{{.Deadline}}</dd>
            <dt>Category:</dt><dd>{{.Category}}</dd>
          </dl>
          <p style="text-align:center; margin-top:24px;">
            <a href="{{.DashboardURL}}" class="btn">View Your Campaign</a>
          </p>
          <p>Thank you for using Impacta to make a difference!</p>
          <p>Warm regards,<br>The Impacta Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Impacta Inc. All rights reserved.</p>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`

func CreateCampaign(c *gin.Context) {
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

	// Only admin or valid user can create campaigns
	if userClaims.Role != "admin" && userClaims.Role != "campaign_creator" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Bind input JSON
	var input struct {
		Title        string    `json:"title" binding:"required"`
		Description  string    `json:"description" binding:"required"`
		TargetAmount float64   `json:"target_amount" binding:"required"`
		Deadline     time.Time `json:"deadline" binding:"required"`
		Currency     string    `json:"currency" binding:"required"`
		Category     string    `json:"category" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create the campaign
	campaign := models.Campaign{
		CreatorID:    uuid.MustParse(userClaims.UserID),
		Title:        input.Title,
		Description:  input.Description,
		TargetAmount: input.TargetAmount,
		Deadline:     input.Deadline,
		Currency:     input.Currency,
		Category:     input.Category,
		Status:       "pending", // Default status
	}

	// Save to database
	if err := utils.DB.Create(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create campaign"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Campaign created successfully",
		"campaign": campaign,
	})

	var user models.User
	if err := utils.DB.Select("full_name", "email").
		Where("id = ?", userClaims.UserID).
		First(&user).Error; err != nil {
		log.Printf("warning: could not load user for email notification: %v", err)
	}

	// 2) fire off email using user.FullName
	go func(to, name string, cam models.Campaign) {
		subject := "Your new campaign is live on Impacta!"
		body := campaignCreatedEmailTemplate
		replacements := map[string]string{
			"{{.CreatorName}}":  name,
			"{{.Title}}":        cam.Title,
			"{{.TargetAmount}}": fmt.Sprintf("%.2f", cam.TargetAmount),
			"{{.Currency}}":     cam.Currency,
			"{{.Deadline}}":     cam.Deadline.Format("Jan 2, 2006"),
			"{{.Category}}":     cam.Category,
			"{{.DashboardURL}}": fmt.Sprintf("https://yourapp.com/campaigns/%s", cam.ID),
		}
		for placeholder, val := range replacements {
			body = strings.ReplaceAll(body, placeholder, val)
		}
		if err := utils.SendEmail(to, subject, body); err != nil {
			log.Printf("error sending campaign email to %s: %v", to, err)
		}
	}(user.Email, user.FullName, campaign)
}

func UpdateCampaign(c *gin.Context) {
	id := c.Param("id")

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

	// Fetch the campaign
	var campaign models.Campaign
	if err := utils.DB.Where("id = ?", id).First(&campaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	// Check permissions: Admins can update any campaign, others can update only their own
	if userClaims.Role != "admin" && campaign.CreatorID.String() != userClaims.UserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Bind input JSON
	var input struct {
		Title        string    `json:"title,omitempty"`
		Description  string    `json:"description,omitempty"`
		TargetAmount float64   `json:"target_amount,omitempty"`
		Deadline     time.Time `json:"deadline,omitempty"`
		Status       string    `json:"status,omitempty"`
		Category     string    `json:"category,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	if input.Title != "" {
		campaign.Title = input.Title
	}
	if input.Description != "" {
		campaign.Description = input.Description
	}
	if input.TargetAmount != 0 {
		campaign.TargetAmount = input.TargetAmount
	}
	if !input.Deadline.IsZero() {
		campaign.Deadline = input.Deadline
	}
	if input.Status != "" {
		campaign.Status = input.Status
	}
	if input.Category != "" {
		campaign.Category = input.Category
	}

	// Save to database
	if err := utils.DB.Save(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update campaign"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Campaign updated successfully", "campaign": campaign})
}

func DeleteCampaign(c *gin.Context) {
	id := c.Param("id")

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

	// Fetch the campaign
	var campaign models.Campaign
	if err := utils.DB.Where("id = ?", id).First(&campaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	// Check permissions: Admins can delete any campaign, others can delete only their own
	if userClaims.Role != "admin" && campaign.CreatorID.String() != userClaims.UserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Delete from database
	if err := utils.DB.Delete(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete campaign"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Campaign deleted successfully"})
}

func ListCampaigns(c *gin.Context) {
	// Query parameters for filtering
	title := c.Query("title")
	category := c.Query("category")
	status := c.Query("status")
	minTargetAmount := c.Query("min_target_amount")
	maxTargetAmount := c.Query("max_target_amount")
	sortBy := c.Query("sort_by") // e.g., "created_at" or "target_amount"
	order := c.Query("order")    // e.g., "asc" or "desc"

	// Initialize the query
	query := utils.DB.Model(&models.Campaign{})

	// Apply filters dynamically
	if title != "" {
		query = query.Where("title ILIKE ?", "%"+title+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if minTargetAmount != "" {
		query = query.Where("target_amount >= ?", minTargetAmount)
	}
	if maxTargetAmount != "" {
		query = query.Where("target_amount <= ?", maxTargetAmount)
	}

	// Apply sorting
	if sortBy != "" {
		// Default to ascending order if order is not specified or invalid
		if order != "asc" && order != "desc" {
			order = "asc"
		}
		query = query.Order(sortBy + " " + order)
	}

	// Fetch campaigns
	var campaigns []models.Campaign
	if err := query.Find(&campaigns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch campaigns"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"campaigns": campaigns})
}

func GetCampaign(c *gin.Context) {
	// Retrieve the campaign ID from the route parameters
	id := c.Param("id")

	// Fetch the campaign from the database
	var campaign models.Campaign
	if err := utils.DB.Where("id = ?", id).First(&campaign).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch campaign"})
		}
		return
	}

	// Return the campaign details
	c.JSON(http.StatusOK, gin.H{"campaign": campaign})
}

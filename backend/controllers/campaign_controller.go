package controllers

import (
	"time"
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)


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
		Title       string    `json:"title,omitempty"`
		Description string    `json:"description,omitempty"`
		TargetAmount float64  `json:"target_amount,omitempty"`
		Deadline    time.Time `json:"deadline,omitempty"`
		Status      string    `json:"status,omitempty"`
		Category    string    `json:"category,omitempty"`
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

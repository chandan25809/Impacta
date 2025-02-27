package controllers

import (
	// "time"
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func MakeDonation(c *gin.Context) {
	// Bind input JSON
	var input struct {
		CampaignID  string  `json:"campaign_id" binding:"required"`
		DonorName   string  `json:"donor_name" binding:"required"`
		Email       string  `json:"email" binding:"required,email"` // Required email for donor tracking
		Amount      float64 `json:"amount" binding:"required"`
		Currency    string  `json:"currency" binding:"required"`
		Message     string  `json:"message,omitempty"`
		IsAnonymous bool    `json:"is_anonymous"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure the campaign exists
	var campaign models.Campaign
	if err := utils.DB.Where("id = ?", input.CampaignID).First(&campaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	// Check if the donor already exists
	var donor models.User
	err := utils.DB.Where("email = ?", input.Email).First(&donor).Error
	if err != nil {
		if err.Error() == "record not found" {
			// Create a new donor entry
			newDonor := models.User{
				ID:           uuid.New(),
				Email:        input.Email,
				PasswordHash: "", // No password for donors
				FullName:     input.DonorName,
				Role:         "donor",
				Status:       "active",
			}

			if err := utils.DB.Create(&newDonor).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create donor user"})
				return
			}

			donor = newDonor
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch donor information"})
			return
		}
	}

	// Create the donation
	donation := models.Donation{
		CampaignID:  uuid.MustParse(input.CampaignID),
		DonorID:     donor.ID,
		Amount:      input.Amount,
		Currency:    input.Currency,
		Message:     input.Message,
		IsAnonymous: input.IsAnonymous,
		Status:      "completed",
	}

	// Save the donation to the database
	if err := utils.DB.Create(&donation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create donation"})
		return
	}

	// Update the campaign's current amount
	campaign.CurrentAmount += input.Amount
	if err := utils.DB.Save(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update campaign"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Donation successful",
		"donation": donation,
		"donor": gin.H{
			"id":        donor.ID,
			"email":     donor.Email,
			"full_name": donor.FullName,
		},
	})
}




func ListCampaignDonations(c *gin.Context) {
	// Get the campaign ID from the request parameters
	campaignID := c.Param("id")

	// Ensure the campaign exists
	var campaign models.Campaign
	if err := utils.DB.Where("id = ?", campaignID).First(&campaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	// Fetch all donations related to the campaign
	var donations []models.Donation
	if err := utils.DB.Where("campaign_id = ?", campaignID).Find(&donations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch donations"})
		return
	}

	// Return donations
	c.JSON(http.StatusOK, gin.H{"donations": donations})
}



func ListUserDonations(c *gin.Context) {
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

	// Check if the user is an admin
	if userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Query parameters for filtering, sorting, and grouping
	campaignID := c.Query("campaign_id") // Filter by campaign
	minAmount := c.Query("min_amount")  // Filter by minimum donation amount
	maxAmount := c.Query("max_amount")  // Filter by maximum donation amount
	sortBy := c.Query("sort_by")        // Column to sort by (e.g., "amount" or "created_at")
	order := c.Query("order")           // Order of sorting (e.g., "asc" or "desc")
	groupBy := c.Query("group_by")      // Group by column (e.g., "campaign_id")

	// Initialize the query
	query := utils.DB.Model(&models.Donation{})

	// Apply filters
	if campaignID != "" {
		query = query.Where("campaign_id = ?", campaignID)
	}
	if minAmount != "" {
		query = query.Where("amount >= ?", minAmount)
	}
	if maxAmount != "" {
		query = query.Where("amount <= ?", maxAmount)
	}

	// Apply grouping
	if groupBy != "" {
		query = query.Group(groupBy)
	}

	// Apply sorting
	if sortBy != "" {
		// Default to ascending order if order is not specified or invalid
		if order != "asc" && order != "desc" {
			order = "asc"
		}
		query = query.Order(sortBy + " " + order)
	}

	// Fetch donations
	var donations []models.Donation
	if err := query.Find(&donations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch donations"})
		return
	}

	// Return the donations
	c.JSON(http.StatusOK, gin.H{"donations": donations})
}


func UpdateDonation(c *gin.Context) {
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

	// Check if the user is an admin
	if userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Get the donation ID from the URL parameter
	donationID := c.Param("id")

	// Fetch the donation
	var donation models.Donation
	if err := utils.DB.Where("id = ?", donationID).First(&donation).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Donation not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch donation"})
		}
		return
	}

	// Fetch the associated campaign
	var campaign models.Campaign
	if err := utils.DB.Where("id = ?", donation.CampaignID).First(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch campaign"})
		return
	}

	// Bind input JSON
	var input struct {
		Amount      float64 `json:"amount,omitempty"`
		Currency    string  `json:"currency,omitempty"`
		Message     string  `json:"message,omitempty"`
		IsAnonymous bool    `json:"is_anonymous,omitempty"`
		Status      string  `json:"status,omitempty"` // completed, pending, failed
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate the amount difference
	amountDifference := 0.0
	if input.Amount != 0 {
		amountDifference = input.Amount - donation.Amount
		donation.Amount = input.Amount
	}

	// Update other fields
	if input.Currency != "" {
		donation.Currency = input.Currency
	}
	if input.Message != "" {
		donation.Message = input.Message
	}
	donation.IsAnonymous = input.IsAnonymous // Explicit boolean update
	if input.Status != "" {
		donation.Status = input.Status
	}

	// Save the updated donation
	if err := utils.DB.Save(&donation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update donation"})
		return
	}

	// Update the campaign's current amount
	campaign.CurrentAmount += amountDifference
	if err := utils.DB.Save(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update campaign"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Donation updated successfully",
		"donation": donation,
	})
}

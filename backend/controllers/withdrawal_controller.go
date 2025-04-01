package controllers

import (
	"net/http"
	"time"

	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CreateWithdrawal creates a new withdrawal record.
func CreateWithdrawal(c *gin.Context) {
	// Retrieve JWT claims (assuming a protected route)
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	_, ok := claims.(*utils.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Bind input JSON
	var input struct {
		CampaignID string  `json:"campaign_id" binding:"required"`
		Amount     float64 `json:"amount" binding:"required"`
		Status     string  `json:"status"` // optional; default to "pending"
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	campaignID, err := uuid.Parse(input.CampaignID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	status := input.Status
	if status == "" {
		status = "pending"
	}

	withdrawal := models.Withdrawal{
		ID:         uuid.New(),
		CampaignID: campaignID,
		Amount:     input.Amount,
		Status:     status,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := utils.DB.Create(&withdrawal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create withdrawal"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Withdrawal created successfully",
		"withdrawal": withdrawal,
	})
}

// GetWithdrawalByID retrieves a withdrawal by its ID.
func GetWithdrawalByID(c *gin.Context) {
	id := c.Param("id")
	var withdrawal models.Withdrawal
	if err := utils.DB.Where("id = ?", id).First(&withdrawal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Withdrawal not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch withdrawal"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"withdrawal": withdrawal})
}

// ListWithdrawals lists all withdrawals, optionally filtered by campaign_id.
func ListWithdrawals(c *gin.Context) {
	campaignID := c.Query("campaign_id")

	query := utils.DB.Model(&models.Withdrawal{})
	if campaignID != "" {
		query = query.Where("campaign_id = ?", campaignID)
	}

	var withdrawals []models.Withdrawal
	if err := query.Find(&withdrawals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch withdrawals"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"withdrawals": withdrawals})
}

// UpdateWithdrawal updates a withdrawal record by its ID. (Admin-only)
func UpdateWithdrawal(c *gin.Context) {
	id := c.Param("id")
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userClaims, ok := claims.(*utils.Claims)
	if !ok || userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	var withdrawal models.Withdrawal
	if err := utils.DB.Where("id = ?", id).First(&withdrawal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Withdrawal not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch withdrawal"})
		}
		return
	}

	var input struct {
		Amount      float64     `json:"amount,omitempty"`
		Status      string      `json:"status,omitempty"`      // pending, processed, failed
		ProcessedAt *time.Time  `json:"processed_at,omitempty"` // optional
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Amount != 0 {
		withdrawal.Amount = input.Amount
	}
	if input.Status != "" {
		withdrawal.Status = input.Status
	}
	if input.ProcessedAt != nil {
		withdrawal.ProcessedAt = input.ProcessedAt
	}
	withdrawal.UpdatedAt = time.Now()

	if err := utils.DB.Save(&withdrawal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update withdrawal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Withdrawal updated successfully",
		"withdrawal": withdrawal,
	})
}

// BulkDeleteWithdrawals deletes multiple withdrawal records by their IDs. (Admin-only)
func BulkDeleteWithdrawals(c *gin.Context) {
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userClaims, ok := claims.(*utils.Claims)
	if !ok || userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	var input struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := utils.DB.Where("id IN ?", input.IDs).Delete(&models.Withdrawal{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete withdrawals"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Withdrawals deleted successfully"})
}

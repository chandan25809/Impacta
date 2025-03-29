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

// CreatePaymentTransaction creates a new payment transaction record.
func CreatePaymentTransaction(c *gin.Context) {
	var input struct {
		DonationID           string  `json:"donation_id" binding:"required"`
		Gateway              string  `json:"gateway" binding:"required"`
		Status               string  `json:"status" binding:"required"` // e.g., "completed", "failed", "pending"
		Amount               float64 `json:"amount" binding:"required"`
		Currency             string  `json:"currency" binding:"required"`
		GatewayTransactionID string  `json:"gateway_transaction_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	donationID, err := uuid.Parse(input.DonationID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid donation ID"})
		return
	}

	pt := models.PaymentTransaction{
		ID:                   uuid.New(),
		DonationID:           donationID,
		Gateway:              input.Gateway,
		Status:               input.Status,
		Amount:               input.Amount,
		Currency:             input.Currency,
		GatewayTransactionID: input.GatewayTransactionID,
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}

	if err := utils.DB.Create(&pt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":             "Payment transaction created successfully",
		"payment_transaction": pt,
	})
}

// GetPaymentTransactionByID retrieves a payment transaction by its ID.
func GetPaymentTransactionByID(c *gin.Context) {
	id := c.Param("id")
	var pt models.PaymentTransaction
	if err := utils.DB.Where("id = ?", id).First(&pt).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Payment transaction not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payment transaction"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"payment_transaction": pt})
}

// ListPaymentTransactions lists all payment transactions, with optional filtering by donation_id.
func ListPaymentTransactions(c *gin.Context) {
	donationID := c.Query("donation_id")

	query := utils.DB.Model(&models.PaymentTransaction{})
	if donationID != "" {
		query = query.Where("donation_id = ?", donationID)
	}

	var pts []models.PaymentTransaction
	if err := query.Find(&pts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payment transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"payment_transactions": pts})
}

// UpdatePaymentTransaction updates a payment transaction by its ID.
// This endpoint is restricted to admins.
func UpdatePaymentTransaction(c *gin.Context) {
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

	id := c.Param("id")
	var pt models.PaymentTransaction
	if err := utils.DB.Where("id = ?", id).First(&pt).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Payment transaction not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payment transaction"})
		}
		return
	}

	var input struct {
		Gateway              string  `json:"gateway,omitempty"`
		Status               string  `json:"status,omitempty"`
		Amount               float64 `json:"amount,omitempty"`
		Currency             string  `json:"currency,omitempty"`
		GatewayTransactionID string  `json:"gateway_transaction_id,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Gateway != "" {
		pt.Gateway = input.Gateway
	}
	if input.Status != "" {
		pt.Status = input.Status
	}
	if input.Amount != 0 {
		pt.Amount = input.Amount
	}
	if input.Currency != "" {
		pt.Currency = input.Currency
	}
	if input.GatewayTransactionID != "" {
		pt.GatewayTransactionID = input.GatewayTransactionID
	}
	pt.UpdatedAt = time.Now()

	if err := utils.DB.Save(&pt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":             "Payment transaction updated successfully",
		"payment_transaction": pt,
	})
}

// BulkDeletePaymentTransactions deletes multiple payment transactions by their IDs.
// This operation is restricted to admins.
func BulkDeletePaymentTransactions(c *gin.Context) {
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

	if err := utils.DB.Where("id IN ?", input.IDs).Delete(&models.PaymentTransaction{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete payment transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment transactions deleted successfully"})
}

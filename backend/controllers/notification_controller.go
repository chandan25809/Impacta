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

// CreateNotification creates a new notification using the user ID from the token.
func CreateNotification(c *gin.Context) {
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

	// Bind input JSON. UserID is not provided in payload; we take it from token.
	var input struct {
		Type    string `json:"type" binding:"required"`    // e.g., "campaign_update", "new_donation"
		Content string `json:"content" binding:"required"` // Notification content
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	notification := models.Notification{
		ID:        uuid.New(),
		UserID:    uuid.MustParse(userClaims.UserID),
		Type:      input.Type,
		Content:   input.Content,
		IsRead:    false,
		Status:    "unread",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := utils.DB.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "Notification created successfully",
		"notification": notification,
	})
}

// GetNotificationByID returns a notification by its ID.
func GetNotificationByID(c *gin.Context) {
	id := c.Param("id")

	var notification models.Notification
	if err := utils.DB.Where("id = ?", id).First(&notification).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notification"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"notification": notification})
}

// ListNotificationsByUser lists all notifications for the authenticated user.
// Admins can view notifications for any user by providing a "user_id" query parameter.
func ListNotificationsByUser(c *gin.Context) {
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

	// Use query parameter "user_id". If not provided, default to the authenticated user's ID.
	userID := c.Query("user_id")
	if userID == "" {
		userID = userClaims.UserID
	} else {
		// If a user_id is provided, and the caller is not admin, deny access if not matching.
		if userClaims.Role != "admin" && userClaims.UserID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only view your own notifications"})
			return
		}
	}

	var notifications []models.Notification
	if err := utils.DB.Where("user_id = ?", userID).Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notifications": notifications})
}

// UpdateNotificationByID updates a notification by its ID.
// Only the owner (from token) or an admin can update.
func UpdateNotificationByID(c *gin.Context) {
	id := c.Param("id")

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

	var notification models.Notification
	if err := utils.DB.Where("id = ?", id).First(&notification).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notification"})
		}
		return
	}

	// Only the owner or admin can update the notification.
	if userClaims.Role != "admin" && notification.UserID.String() != userClaims.UserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	var input struct {
		Type    string `json:"type,omitempty"`
		Content string `json:"content,omitempty"`
		IsRead  *bool  `json:"is_read,omitempty"`
		Status  string `json:"status,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Type != "" {
		notification.Type = input.Type
	}
	if input.Content != "" {
		notification.Content = input.Content
	}
	if input.IsRead != nil {
		notification.IsRead = *input.IsRead
	}
	if input.Status != "" {
		notification.Status = input.Status
	}

	notification.UpdatedAt = time.Now()

	if err := utils.DB.Save(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Notification updated successfully",
		"notification": notification,
	})
}

// BulkDeleteNotifications deletes multiple notifications by their IDs.
// Only the owner or an admin can perform bulk deletion.
func BulkDeleteNotifications(c *gin.Context) {
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

	var input struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For non-admin users, ensure all notifications belong to the authenticated user.
	if userClaims.Role != "admin" {
		for _, id := range input.IDs {
			var notif models.Notification
			if err := utils.DB.Where("id = ?", id).First(&notif).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found: " + id})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notification: " + id})
				}
				return
			}
			if notif.UserID.String() != userClaims.UserID {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied for notification: " + id})
				return
			}
		}
		// Delete notifications that belong to the user.
		if err := utils.DB.Where("id IN ? AND user_id = ?", input.IDs, userClaims.UserID).Delete(&models.Notification{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notifications"})
			return
		}
	} else {
		// Admin can delete any notifications.
		if err := utils.DB.Where("id IN ?", input.IDs).Delete(&models.Notification{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notifications"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notifications deleted successfully"})
}

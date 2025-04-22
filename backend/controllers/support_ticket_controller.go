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

// CreateSupportTicket creates a new support ticket using the authenticated user's ID.
func CreateSupportTicket(c *gin.Context) {
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
		CampaignID string `json:"campaign_id"` // Optional for general queries
		Type       string `json:"type" binding:"required"`     // dispute, general_query
		Priority   string `json:"priority" binding:"required"` // low, medium, high
		Query      string `json:"query"`                       // New field
		Answer     string `json:"answer"`                      // New field
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var campaignID uuid.UUID
	if input.CampaignID != "" {
		var err error
		campaignID, err = uuid.Parse(input.CampaignID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
			return
		}
	}

	ticket := models.SupportTicket{
		ID:         uuid.New(),
		UserID:     uuid.MustParse(userClaims.UserID),
		CampaignID: campaignID, // If empty, remains zero UUID
		Type:       input.Type,
		Priority:   input.Priority,
		Status:     "open", // default status
		Query:      input.Query,
		Answer:     input.Answer,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := utils.DB.Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create support ticket"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Support ticket created successfully",
		"ticket":  ticket,
	})
}

// GetSupportTicketByID returns a support ticket by its ID.
func GetSupportTicketByID(c *gin.Context) {
	id := c.Param("id")
	var ticket models.SupportTicket
	if err := utils.DB.Where("id = ?", id).First(&ticket).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Support ticket not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch support ticket"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"ticket": ticket})
}

// ListSupportTickets lists all support tickets for a given user.
// Non-admin users can only view their own tickets. Admins can filter by user_id.
func ListSupportTickets(c *gin.Context) {
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

    var tickets []models.SupportTicket
    var err error

    if userClaims.Role == "admin" {
        // Admins get all tickets
        err = utils.DB.Find(&tickets).Error
    } else {
        // Non‑admins: allow optional ?user_id= but only their own
        userID := c.Query("user_id")
        if userID == "" {
            userID = userClaims.UserID
        } else if userClaims.UserID != userID {
            c.JSON(http.StatusForbidden, gin.H{"error": "You can only view your own support tickets"})
            return
        }

        err = utils.DB.
            Where("user_id = ?", userID).
            Find(&tickets).
            Error
    }

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch support tickets"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"tickets": tickets})
}


// UpdateSupportTicketByID updates a support ticket by its ID.
// Only the ticket owner or an admin can update.
func UpdateSupportTicketByID(c *gin.Context) {
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

	var ticket models.SupportTicket
	if err := utils.DB.Where("id = ?", id).First(&ticket).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Support ticket not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch support ticket"})
		}
		return
	}

	// Only owner or admin can update
	if userClaims.Role != "admin" && ticket.UserID.String() != userClaims.UserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	var input struct {
		Type     string `json:"type,omitempty"`
		Priority string `json:"priority,omitempty"`
		Status   string `json:"status,omitempty"` // open, resolved, closed
		Query    string `json:"query,omitempty"`
		Answer   string `json:"answer,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Type != "" {
		ticket.Type = input.Type
	}
	if input.Priority != "" {
		ticket.Priority = input.Priority
	}
	if input.Status != "" {
		ticket.Status = input.Status
	}
	if input.Query != "" {
		ticket.Query = input.Query
	}
	if input.Answer != "" {
		ticket.Answer = input.Answer
	}
	ticket.UpdatedAt = time.Now()

	if err := utils.DB.Save(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update support ticket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Support ticket updated successfully",
		"ticket":  ticket,
	})
}

// BulkDeleteSupportTickets deletes multiple support tickets by their IDs.
// Only the ticket owner or an admin can perform this action.
func BulkDeleteSupportTickets(c *gin.Context) {
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

	// For non-admin users, ensure all tickets belong to the authenticated user.
	if userClaims.Role != "admin" {
		for _, id := range input.IDs {
			var ticket models.SupportTicket
			if err := utils.DB.Where("id = ?", id).First(&ticket).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					c.JSON(http.StatusNotFound, gin.H{"error": "Support ticket not found: " + id})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch support ticket: " + id})
				}
				return
			}
			if ticket.UserID.String() != userClaims.UserID {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied for support ticket: " + id})
				return
			}
		}
		// Delete tickets that belong to the user.
		if err := utils.DB.Where("id IN ? AND user_id = ?", input.IDs, userClaims.UserID).Delete(&models.SupportTicket{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete support tickets"})
			return
		}
	} else {
		// Admin can delete any support tickets.
		if err := utils.DB.Where("id IN ?", input.IDs).Delete(&models.SupportTicket{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete support tickets"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Support tickets deleted successfully"})
}

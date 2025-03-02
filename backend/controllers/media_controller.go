package controllers

import (
	"net/http"
	"time"

	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateMediaFile creates a new media file record.
// Only authenticated users (admin or campaign_creator) can add media files.
func CreateMediaFile(c *gin.Context) {
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

	// Optionally, you can restrict this endpoint to specific roles
	if userClaims.Role != "admin" && userClaims.Role != "campaign_creator" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Bind input JSON
	var input struct {
		CampaignID string `json:"campaign_id" binding:"required"`
		FileType   string `json:"file_type" binding:"required"`
		URL        string `json:"url" binding:"required"`
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

	media := models.MediaFile{
		ID:         uuid.New(),
		CampaignID: campaignID,
		FileType:   input.FileType,
		URL:        input.URL,
		Status:     "active",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := utils.DB.Create(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create media file"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Media file created successfully",
		"media_file": media,
	})
}

// GetMediaFile retrieves a media file by its ID.
func GetMediaFile(c *gin.Context) {
	idParam := c.Param("id")
	mediaID, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media file ID"})
		return
	}

	var media models.MediaFile
	if err := utils.DB.First(&media, "id = ?", mediaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media file not found"})
		return
	}

	c.JSON(http.StatusOK, media)
}

// ListMediaFilesByCampaignID returns all media files associated with a specific campaign.
func ListMediaFilesByCampaignID(c *gin.Context) {
	campaignParam := c.Param("campaign_id")
	campaignID, err := uuid.Parse(campaignParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	var mediaFiles []models.MediaFile
	if err := utils.DB.Where("campaign_id = ?", campaignID).Find(&mediaFiles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve media files"})
		return
	}

	c.JSON(http.StatusOK, mediaFiles)
}

// ListMediaFilesByUserID returns media files for campaigns belonging to a specific user.
// This example assumes that the Campaign model has a CreatorID field.
func ListMediaFilesByUserID(c *gin.Context) {
	userParam := c.Param("user_id")
	userID, err := uuid.Parse(userParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Join media_files with campaigns to filter by the campaign creator.
	var mediaFiles []models.MediaFile
	err = utils.DB.
	Joins("JOIN campaigns ON campaigns.id = mediafiles.campaign_id").
	Where("campaigns.creator_id = ?", userID).
	Find(&mediaFiles).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve media files"})
		return
	}

	c.JSON(http.StatusOK, mediaFiles)
}

// BulkDeleteMediaFiles deletes multiple media files provided by a list of IDs.
// Only the campaign owner or an admin is allowed to delete the media files.
func BulkDeleteMediaFiles(c *gin.Context) {
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

	var payload struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil || len(payload.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A non-empty list of media file IDs is required"})
		return
	}

	// Convert string IDs to UUIDs
	var uuids []uuid.UUID
	for _, idStr := range payload.IDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media file ID: " + idStr})
			return
		}
		uuids = append(uuids, id)
	}

	// Retrieve media files for verification
	var mediaFiles []models.MediaFile
	if err := utils.DB.Where("id IN ?", uuids).Find(&mediaFiles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch media files"})
		return
	}

	// Validate that the current user is authorized to delete each media file.
	for _, media := range mediaFiles {
		// Retrieve the campaign linked to the media file.
		var campaign models.Campaign
		if err := utils.DB.First(&campaign, "id = ?", media.CampaignID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify media file ownership"})
			return
		}
		// Allow deletion if current user is an admin or the creator of the campaign.
		if userClaims.Role != "admin" && campaign.CreatorID.String() != userClaims.UserID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete one or more media files"})
			return
		}
	}

	// Proceed to delete the media files.
	if err := utils.DB.Delete(&models.MediaFile{}, "id IN ?", uuids).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete media files"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Media files deleted successfully"})
}

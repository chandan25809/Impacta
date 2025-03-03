package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"
	"time"

	"backend/controllers"
	"backend/models"
	"backend/utils"
	"golang.org/x/crypto/bcrypt"


	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupMediaTestDB connects to the test database and runs AutoMigrate for User, Campaign, and MediaFile models.
func setupMediaTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	// Migrate required models.
	if err := db.AutoMigrate(&models.User{}, &models.Campaign{}, &models.MediaFile{}); err != nil {
		t.Fatalf("failed to migrate models: %v", err)
	}

	// Clean up tables.
	db.Exec("TRUNCATE TABLE mediafiles RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE campaigns RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")

	// Assign the test DB globally.
	utils.DB = db
	return db
}

// createTestUser3 creates a user for testing and returns its ID.
func createTestUser3(db *gorm.DB, email, fullName, role, password string) uuid.UUID {
	uid := uuid.New()
	// Hash the password if provided.
	var passwordHash string
	if password != "" {
		// Ignoring error for simplicity in tests.
		hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		passwordHash = string(hashed)
	}
	user := models.User{
		ID:           uid,
		Email:        email,
		FullName:     fullName,
		Role:         role,
		Status:       "active",
		PasswordHash: passwordHash,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	if err := utils.DB.Create(&user).Error; err != nil {
		panic("failed to create test user: " + err.Error())
	}
	return uid
}

// createTestCampaign1 creates a campaign for testing and returns its ID.
func createTestCampaign1(db *gorm.DB, creatorID uuid.UUID, title string) uuid.UUID {
	campaign := models.Campaign{
		ID:            uuid.New(),
		CreatorID:     creatorID,
		Title:         title,
		Description:   "Test campaign description",
		TargetAmount:  1000,
		CurrentAmount: 0,
		Deadline:      time.Now().Add(72 * time.Hour),
		Status:        "pending",
		Currency:      "USD",
		Category:      "test",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	if err := utils.DB.Create(&campaign).Error; err != nil {
		panic("failed to create test campaign: " + err.Error())
	}
	return campaign.ID
}

// createTestClaims3 creates dummy JWT claims for testing.
func createTestClaims3(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
		// Additional fields if needed.
	}
}

// TestCreateMediaFile tests the CreateMediaFile controller.
func TestCreateMediaFile(t *testing.T) {
	db := setupMediaTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/mediafiles", controllers.CreateMediaFile)

	// Create a test campaign.
	creatorID := createTestUser3(db, "creator_media@example.com", "Media Creator", "campaign_creator", "dummy")
	campaignID := createTestCampaign1(db, creatorID, "Media Campaign")

	// Create JWT claims for an authenticated user.
	claims := createTestClaims3(creatorID.String(), "campaign_creator")

	// Prepare request payload.
	payload := map[string]string{
		"campaign_id": campaignID.String(),
		"file_type":   "image",
		"url":         "http://example.com/image.png",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "/mediafiles", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.CreateMediaFile(c)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	// Verify the media file was created.
	var media models.MediaFile
	if err := db.Where("url = ?", "http://example.com/image.png").First(&media).Error; err != nil {
		t.Errorf("failed to create media file in DB: %v", err)
	}
}

// TestGetMediaFile tests retrieving a media file by ID.
func TestGetMediaFile(t *testing.T) {
	db := setupMediaTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/mediafiles/:id", controllers.GetMediaFile)

	// Create a media file.
	media := models.MediaFile{
		ID:         uuid.New(),
		CampaignID: uuid.New(),
		FileType:   "video",
		URL:        "http://example.com/video.mp4",
		Status:     "active",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&media).Error; err != nil {
		t.Fatalf("failed to create media file: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/mediafiles/"+media.ID.String(), nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var gotMedia models.MediaFile
	if err := json.Unmarshal(rr.Body.Bytes(), &gotMedia); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if gotMedia.URL != "http://example.com/video.mp4" {
		t.Errorf("expected media URL to be 'http://example.com/video.mp4', got %s", gotMedia.URL)
	}
}

// TestListMediaFilesByCampaignID tests listing media files by campaign.
func TestListMediaFilesByCampaignID(t *testing.T) {
	db := setupMediaTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/campaigns/:campaign_id/mediafiles", controllers.ListMediaFilesByCampaignID)

	// Create a test campaign.
	creatorID := createTestUser3(db, "creator_media2@example.com", "Media Creator2", "campaign_creator", "dummy")
	campaignID := createTestCampaign1(db, creatorID, "Campaign For Media List")

	// Create two media files for that campaign.
	for i := 0; i < 2; i++ {
		media := models.MediaFile{
			ID:         uuid.New(),
			CampaignID: campaignID,
			FileType:   "image",
			URL:        "http://example.com/image" + strconv.Itoa(i) + ".png",
			Status:     "active",
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := db.Create(&media).Error; err != nil {
			t.Fatalf("failed to create media file: %v", err)
		}
	}

	url := "/campaigns/" + campaignID.String() + "/mediafiles"
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var mediaFiles []models.MediaFile
	if err := json.Unmarshal(rr.Body.Bytes(), &mediaFiles); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if len(mediaFiles) != 2 {
		t.Errorf("expected 2 media files, got %d", len(mediaFiles))
	}
}

// TestListMediaFilesByUserID tests listing media files by user.
// This uses a join: it fetches media files for campaigns where the creator matches the given user.
func TestListMediaFilesByUserID(t *testing.T) {
	db := setupMediaTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/users/:user_id/mediafiles", controllers.ListMediaFilesByUserID)

	// Create a test user (campaign creator).
	creatorID := createTestUser3(db, "creator_media3@example.com", "Media Creator3", "campaign_creator", "dummy")
	// Create a campaign with this creator.
	campaignID := createTestCampaign1(db, creatorID, "Campaign for Media By User")

	// Create two media files for that campaign.
	for i := 0; i < 2; i++ {
		media := models.MediaFile{
			ID:         uuid.New(),
			CampaignID: campaignID,
			FileType:   "image",
			URL:        "http://example.com/usermedia" + strconv.Itoa(i) + ".png",
			Status:     "active",
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := db.Create(&media).Error; err != nil {
			t.Fatalf("failed to create media file: %v", err)
		}
	}

	url := "/users/" + creatorID.String() + "/mediafiles"
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var mediaFiles []models.MediaFile
	if err := json.Unmarshal(rr.Body.Bytes(), &mediaFiles); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if len(mediaFiles) != 2 {
		t.Errorf("expected 2 media files, got %d", len(mediaFiles))
	}
}

// TestBulkDeleteMediaFiles tests the BulkDeleteMediaFiles controller.
func TestBulkDeleteMediaFiles(t *testing.T) {
	db := setupMediaTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/mediafiles/bulk", controllers.BulkDeleteMediaFiles)

	// Create a test user (campaign creator).
	creatorID := createTestUser3(db, "creator_bulk@example.com", "Bulk Creator", "campaign_creator", "dummy")
	claims := createTestClaims3(creatorID.String(), "campaign_creator")

	// Create a campaign with this creator.
	campaignID := createTestCampaign1(db, creatorID, "Bulk Delete Campaign")

	// Create two media files for that campaign.
	var ids []string
	for i := 0; i < 2; i++ {
		media := models.MediaFile{
			ID:         uuid.New(),
			CampaignID: campaignID,
			FileType:   "video",
			URL:        "http://example.com/bulkmedia" + strconv.Itoa(i) + ".mp4",
			Status:     "active",
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := db.Create(&media).Error; err != nil {
			t.Fatalf("failed to create media file: %v", err)
		}
		ids = append(ids, media.ID.String())
	}

	// Prepare bulk delete payload.
	payload := map[string]interface{}{
		"ids": ids,
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodDelete, "/mediafiles/bulk", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.BulkDeleteMediaFiles(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Verify that media files are deleted.
	var count int64
	db.Model(&models.MediaFile{}).Where("id IN ?", ids).Count(&count)
	if count != 0 {
		t.Errorf("expected media files to be deleted, but %d remain", count)
	}
}

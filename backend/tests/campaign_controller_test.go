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
	"golang.org/x/crypto/bcrypt"
	"backend/controllers"
	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupCampaignTestDB connects to the test DB using PostgreSQL driver and auto-migrates required models.
func setupCampaignTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// Migrate both User and Campaign models.
	if err := db.AutoMigrate(&models.User{}, &models.Campaign{}); err != nil {
		t.Fatalf("failed to migrate models: %v", err)
	}

	// Clean up tables before tests.
	db.Exec("TRUNCATE TABLE campaigns RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")

	// Set global DB for controllers.
	utils.DB = db

	return db
}

// createTestUser1 creates a user for testing and returns its ID.
func createTestUser1(db *gorm.DB, email, fullName, role, password string) uuid.UUID {
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

// createTestClaims1 creates dummy JWT claims for testing.
func createTestClaims1(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
		// You can add additional fields if needed.
	}
}

// TestCreateCampaign tests creating a new campaign.
func TestCreateCampaign(t *testing.T) {
	db := setupCampaignTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/campaigns", controllers.CreateCampaign)

	// Create a test user who will be the campaign creator.
	userID := createTestUser1(db, "creator@example.com", "Campaign Creator", "campaign_creator", "dummy")
	claims := createTestClaims1(userID.String(), "campaign_creator")

	// Prepare a JSON payload for creating a campaign.
	payload := map[string]interface{}{
		"title":         "Test Campaign",
		"description":   "This is a test campaign.",
		"target_amount": 5000,
		"deadline":      time.Now().Add(48 * time.Hour).Format(time.RFC3339),
		"currency":      "USD",
		"category":      "education",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "/campaigns", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	// Create a Gin context and inject test claims.
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.CreateCampaign(c)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	// Verify the campaign exists in the test DB.
	var campaign models.Campaign
	if err := db.Where("title = ?", "Test Campaign").First(&campaign).Error; err != nil {
		t.Errorf("failed to create campaign in DB: %v", err)
	}
}

// TestUpdateCampaign tests updating an existing campaign.
func TestUpdateCampaign(t *testing.T) {
	db := setupCampaignTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.PUT("/campaigns/:id", controllers.UpdateCampaign)

	// Create a campaign to update.
	campaign := models.Campaign{
		ID:            uuid.New(),
		CreatorID:     uuid.New(), // We'll override with test claims.
		Title:         "Original Title",
		Description:   "Original description",
		TargetAmount:  1000,
		Deadline:      time.Now().Add(48 * time.Hour),
		Currency:      "USD",
		Category:      "health",
		Status:        "pending",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	if err := db.Create(&campaign).Error; err != nil {
		t.Fatalf("failed to create campaign: %v", err)
	}

	// Use the campaign's CreatorID for test claims.
	testUserID := campaign.CreatorID.String()
	claims := createTestClaims1(testUserID, "campaign_creator")

	// Prepare update payload.
	payload := map[string]interface{}{
		"title":         "Updated Title",
		"description":   "Updated description",
		"target_amount": 2000,
		"category":      "education",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPut, "/campaigns/"+campaign.ID.String(), bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	// Set route parameter "id"
	c.Params = gin.Params{{Key: "id", Value: campaign.ID.String()}}

	controllers.UpdateCampaign(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Verify updates in DB.
	var updatedCampaign models.Campaign
	if err := db.Where("id = ?", campaign.ID).First(&updatedCampaign).Error; err != nil {
		t.Fatalf("failed to fetch updated campaign: %v", err)
	}
	if updatedCampaign.Title != "Updated Title" {
		t.Errorf("expected title to be updated, got %s", updatedCampaign.Title)
	}
}

// TestDeleteCampaign tests deleting an existing campaign.
func TestDeleteCampaign(t *testing.T) {
	db := setupCampaignTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/campaigns/:id", controllers.DeleteCampaign)

	// Create a campaign.
	campaign := models.Campaign{
		ID:            uuid.New(),
		CreatorID:     uuid.New(),
		Title:         "Campaign To Delete",
		Description:   "To be deleted",
		TargetAmount:  1500,
		Deadline:      time.Now().Add(24 * time.Hour),
		Currency:      "USD",
		Category:      "environment",
		Status:        "pending",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	if err := db.Create(&campaign).Error; err != nil {
		t.Fatalf("failed to create campaign: %v", err)
	}

	// Create test claims matching the campaign's creator.
	claims := createTestClaims1(campaign.CreatorID.String(), "campaign_creator")

	req, err := http.NewRequest(http.MethodDelete, "/campaigns/"+campaign.ID.String(), nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	c.Params = gin.Params{{Key: "id", Value: campaign.ID.String()}}

	controllers.DeleteCampaign(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Verify the campaign is deleted.
	var count int64
	db.Model(&models.Campaign{}).Where("id = ?", campaign.ID).Count(&count)
	if count != 0 {
		t.Error("campaign was not deleted from the database")
	}
}

// TestListCampaigns tests listing campaigns with filters and sorting.
func TestListCampaigns(t *testing.T) {
	db := setupCampaignTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/campaigns", controllers.ListCampaigns)

	// Insert sample campaigns.
	for i := 1; i <= 3; i++ {
		campaign := models.Campaign{
			ID:            uuid.New(),
			CreatorID:     uuid.New(),
			Title:         "Campaign " + strconv.Itoa(i),
			Description:   "Description " + strconv.Itoa(i),
			TargetAmount:  float64(1000 * i),
			Deadline:      time.Now().Add(time.Duration(24*i) * time.Hour),
			Currency:      "USD",
			Category:      "category" + strconv.Itoa(i),
			Status:        "pending",
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		}
		if err := db.Create(&campaign).Error; err != nil {
			t.Fatalf("failed to create campaign: %v", err)
		}
	}

	req, err := http.NewRequest(http.MethodGet, "/campaigns?sort_by=created_at&order=asc", nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Decode response to verify the number of campaigns.
	var resp map[string][]models.Campaign
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if len(resp["campaigns"]) != 3 {
		t.Errorf("expected 3 campaigns, got %d", len(resp["campaigns"]))
	}
}

// TestGetCampaign tests retrieving a single campaign.
func TestGetCampaign(t *testing.T) {
	db := setupCampaignTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/campaigns/:id", controllers.GetCampaign)

	// Create a campaign.
	campaign := models.Campaign{
		ID:            uuid.New(),
		CreatorID:     uuid.New(),
		Title:         "Single Campaign",
		Description:   "Description of single campaign",
		TargetAmount:  3000,
		Deadline:      time.Now().Add(72 * time.Hour),
		Currency:      "USD",
		Category:      "tech",
		Status:        "pending",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	if err := db.Create(&campaign).Error; err != nil {
		t.Fatalf("failed to create campaign: %v", err)
	}

	req, err := http.NewRequest(http.MethodGet, "/campaigns/"+campaign.ID.String(), nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]models.Campaign
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if campaignResp, ok := resp["campaign"]; !ok || campaignResp.Title != "Single Campaign" {
		t.Error("campaign details not returned as expected")
	}
}

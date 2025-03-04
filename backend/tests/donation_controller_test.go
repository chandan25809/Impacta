package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"golang.org/x/crypto/bcrypt"
	"os"
	"strconv"
	"testing"
	"time"

	"backend/controllers"
	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupDonationTestDB initializes the test DB and migrates User, Campaign, and Donation models.
func setupDonationTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}
	// Migrate the required models.
	if err := db.AutoMigrate(&models.User{}, &models.Campaign{}, &models.Donation{}); err != nil {
		t.Fatalf("failed to migrate models: %v", err)
	}

	// Clean up tables.
	db.Exec("TRUNCATE TABLE donations RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE campaigns RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")

	// Set global DB for controllers.
	utils.DB = db
	return db
}

// createTestUser2 creates a user for testing and returns its ID.
func createTestUser2(db *gorm.DB, email, fullName, role, password string) uuid.UUID {
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

// createTestCampaign creates a campaign for testing and returns its ID.
func createTestCampaign(db *gorm.DB, creatorID uuid.UUID, title string) uuid.UUID {
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

// createTestClaims2 creates dummy JWT claims for testing.
func createTestClaims2(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
		// Additional fields if necessary.
	}
}

// TestMakeDonation tests the MakeDonation controller.
func TestMakeDonation(t *testing.T) {
	db := setupDonationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/donations", controllers.MakeDonation)

	// Create a test campaign.
	creatorID := createTestUser2(db, "creator@example.com", "Creator", "campaign_creator", "dummy")
	campaignID := createTestCampaign(db, creatorID, "Donation Campaign")

	// Prepare donation payload.
	payload := map[string]interface{}{
		"campaign_id": campaignID.String(),
		"donor_name":  "Donor One",
		"email":       "donor1@example.com",
		"amount":      100.50,
		"currency":    "USD",
		"message":     "Great cause!",
		"is_anonymous": false,
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "/donations", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	// Make the request (no claims required since MakeDonation is public)
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	// Optionally, check that the donation is stored.
	var donation models.Donation
	if err := db.Where("campaign_id = ?", campaignID.String()).First(&donation).Error; err != nil {
		t.Errorf("failed to create donation in DB: %v", err)
	}

	// Verify campaign's current amount updated.
	var campaign models.Campaign
	if err := db.Where("id = ?", campaignID).First(&campaign).Error; err != nil {
		t.Errorf("failed to fetch campaign: %v", err)
	}
	if campaign.CurrentAmount != 100.50 {
		t.Errorf("expected campaign current amount to be 100.50, got %f", campaign.CurrentAmount)
	}
}

// TestListCampaignDonations tests the ListCampaignDonations controller.
func TestListCampaignDonations(t *testing.T) {
	db := setupDonationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/campaigns/:id/donations", controllers.ListCampaignDonations)

	// Create a test campaign.
	creatorID := createTestUser2(db, "creator2@example.com", "Creator2", "campaign_creator", "dummy")
	campaignID := createTestCampaign(db, creatorID, "List Donations Campaign")

	// Create two test donations associated with that campaign.
	donorID := createTestUser2(db, "donor2@example.com", "Donor2", "donor", "")
	for i := 0; i < 2; i++ {
		donation := models.Donation{
			ID:          uuid.New(),
			CampaignID:  campaignID,
			DonorID:     donorID,
			Amount:      250.00 + float64(i)*10, // Different amounts if needed
			Currency:    "USD",
			Message:     "Keep it up! donation " + strconv.Itoa(i+1),
			IsAnonymous: false,
			Status:      "completed",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		if err := db.Create(&donation).Error; err != nil {
			t.Fatalf("failed to create donation: %v", err)
		}
	}

	url := "/campaigns/" + campaignID.String() + "/donations"
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Decode response into a wrapper struct
	var resp struct {
		Donations []models.Donation `json:"donations"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if len(resp.Donations) < 2 {
		t.Errorf("expected at least 2 donations, got %d", len(resp.Donations))
	}
}

// TestListUserDonations tests the ListUserDonations controller.
func TestListUserDonations(t *testing.T) {
	db := setupDonationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/user/donations", controllers.ListUserDonations)

	// Create an admin user for testing.
	adminID := createTestUser2(db, "admin@example.com", "Admin User", "admin", "dummy")
	adminClaims := createTestClaims2(adminID.String(), "admin")

	// Create a test campaign.
	creatorID := createTestUser2(db, "creator3@example.com", "Creator3", "campaign_creator", "dummy")
	campaignID := createTestCampaign(db, creatorID, "User Donations Campaign")

	// Create 2 donations for that campaign.
	for i := 1; i <= 2; i++ {
		donorID := createTestUser2(db, "donor"+strconv.Itoa(i)+"@example.com", "Donor "+strconv.Itoa(i), "donor", "")
		donation := models.Donation{
			ID:          uuid.New(),
			CampaignID:  campaignID,
			DonorID:     donorID,
			Amount:      float64(100 * i),
			Currency:    "USD",
			Message:     "Donation " + strconv.Itoa(i),
			IsAnonymous: false,
			Status:      "completed",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		if err := db.Create(&donation).Error; err != nil {
			t.Fatalf("failed to create donation: %v", err)
		}
	}

	// Create request with query parameters to filter by campaign.
	req, _ := http.NewRequest(http.MethodGet, "/user/donations?campaign_id="+campaignID.String(), nil)
	rr := httptest.NewRecorder()

	// Create a Gin context and inject admin claims.
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", adminClaims)

	controllers.ListUserDonations(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Decode the response into a wrapper struct.
	var resp struct {
		Donations []models.Donation `json:"donations"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if len(resp.Donations) < 2 {
		t.Errorf("expected at least 2 donations, got %d", len(resp.Donations))
	}
}

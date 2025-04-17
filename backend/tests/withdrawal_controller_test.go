package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"backend/controllers"
	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupWithdrawalTestDB connects to your test PostgreSQL database, auto-migrates the Withdrawal model,
// and truncates its table using the actual table name ("withdrawals").
func setupWithdrawalTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	// AutoMigrate the Withdrawal model.
	if err := db.AutoMigrate(&models.Withdrawal{}); err != nil {
		t.Fatalf("failed to migrate Withdrawal model: %v", err)
	}

	// Truncate the table using the actual table name.
	db.Exec("TRUNCATE TABLE withdrawals RESTART IDENTITY CASCADE")

	// Set the global DB instance.
	utils.DB = db
	return db
}

// createTestUserForWithdrawal creates a test user and returns its ID.
// A unique identifier is appended to the email to avoid duplicate errors.
func createTestUserForWithdrawal(t *testing.T, db *gorm.DB, email, fullName, role, password string) uuid.UUID {
	uid := uuid.New()
	uniqueEmail := email + "-" + uid.String()
	var passwordHash string
	if password != "" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		passwordHash = string(hashed)
	}
	user := models.User{
		ID:           uid,
		Email:        uniqueEmail,
		FullName:     fullName,
		Role:         role,
		Status:       "active",
		PasswordHash: passwordHash,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}
	return uid
}

// createTestClaimsForWithdrawal returns dummy JWT claims for testing.
func createTestClaimsForWithdrawal(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
	}
}

// TestCreateWithdrawal tests creating a new withdrawal.
func TestCreateWithdrawal(t *testing.T) {
	db := setupWithdrawalTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/withdrawals", controllers.CreateWithdrawal)

	// Create a test user to simulate an authenticated request.
	userID := createTestUserForWithdrawal(t, db, "withdrawalcreator@example.com", "Withdrawal Creator", "campaign_creator", "dummy")
	claims := createTestClaimsForWithdrawal(userID.String(), "campaign_creator")

	// Use a dummy campaign ID.
	campaignID := uuid.New()

	// Prepare the request payload.
	payload := map[string]interface{}{
		"campaign_id": campaignID.String(),
		"amount":      150.0,
		"status":      "pending",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("failed to marshal payload: %v", err)
	}

	req, err := http.NewRequest(http.MethodPost, "/withdrawals", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req

	// Set the JWT claims to simulate an authenticated request.
	c.Set("claims", claims)

	controllers.CreateWithdrawal(c)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if resp["message"] != "Withdrawal created successfully" {
		t.Errorf("unexpected message: %v", resp["message"])
	}

	// Verify creation in the database.
	var withdrawal models.Withdrawal
	if err := db.Where("amount = ?", 150.0).First(&withdrawal).Error; err != nil {
		t.Errorf("failed to find withdrawal in DB: %v", err)
	}
}

// TestGetWithdrawalByID tests retrieving a withdrawal by its ID.
func TestGetWithdrawalByID(t *testing.T) {
	db := setupWithdrawalTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/withdrawals/:id", controllers.GetWithdrawalByID)

	// Create a withdrawal record.
	withdrawal := models.Withdrawal{
		ID:         uuid.New(),
		CampaignID: uuid.New(),
		Amount:     200.0,
		Status:     "pending",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&withdrawal).Error; err != nil {
		t.Fatalf("failed to create withdrawal: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/withdrawals/"+withdrawal.ID.String(), nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	withdrawalData, ok := resp["withdrawal"].(map[string]interface{})
	if !ok {
		t.Fatalf("withdrawal data not in expected format")
	}
	if withdrawalData["Amount"].(float64) != 200.0 {
		t.Errorf("expected amount 200.0, got %v", withdrawalData["Amount"])
	}
}

// TestListWithdrawals tests listing withdrawals, optionally filtering by campaign_id.
func TestListWithdrawals(t *testing.T) {
	db := setupWithdrawalTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/withdrawals", controllers.ListWithdrawals)

	// Create two withdrawal records with the same campaign_id.
	campaignID := uuid.New()
	for i := 0; i < 2; i++ {
		withdrawal := models.Withdrawal{
			ID:         uuid.New(),
			CampaignID: campaignID,
			Amount:     float64(50 * (i + 1)),
			Status:     "pending",
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := db.Create(&withdrawal).Error; err != nil {
			t.Fatalf("failed to create withdrawal: %v", err)
		}
	}

	url := "/withdrawals?campaign_id=" + campaignID.String()
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	withdrawals, ok := resp["withdrawals"].([]interface{})
	if !ok {
		t.Fatalf("expected withdrawals to be an array")
	}
	if len(withdrawals) != 2 {
		t.Errorf("expected 2 withdrawals, got %d", len(withdrawals))
	}
}

// TestUpdateWithdrawal tests updating a withdrawal record (admin-only endpoint).
func TestUpdateWithdrawal(t *testing.T) {
	db := setupWithdrawalTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.PUT("/withdrawals/:id", controllers.UpdateWithdrawal)

	// Create a test user with admin role.
	userID := createTestUserForWithdrawal(t, db, "admin_withdrawal@example.com", "Admin Withdrawal", "admin", "dummy")
	claims := createTestClaimsForWithdrawal(userID.String(), "admin")

	withdrawal := models.Withdrawal{
		ID:         uuid.New(),
		CampaignID: uuid.New(),
		Amount:     300.0,
		Status:     "pending",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&withdrawal).Error; err != nil {
		t.Fatalf("failed to create withdrawal: %v", err)
	}

	// Prepare update payload.
	updatePayload := map[string]interface{}{
		"amount": 350.0,
		"status": "processed",
	}
	jsonPayload, _ := json.Marshal(updatePayload)
	req, _ := http.NewRequest(http.MethodPut, "/withdrawals/"+withdrawal.ID.String(), bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	c.Params = gin.Params{{Key: "id", Value: withdrawal.ID.String()}}

	controllers.UpdateWithdrawal(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	updatedWithdrawal, ok := resp["withdrawal"].(map[string]interface{})
	if !ok {
		t.Fatalf("invalid withdrawal data in response")
	}
	if updatedWithdrawal["Status"] != "processed" {
		t.Errorf("expected status 'processed', got %v", updatedWithdrawal["Status"])
	}
	if updatedWithdrawal["Amount"].(float64) != 350.0 {
		t.Errorf("expected amount 350.0, got %v", updatedWithdrawal["Amount"])
	}
}

// TestBulkDeleteWithdrawals tests bulk deletion of withdrawal records (admin-only endpoint).
func TestBulkDeleteWithdrawals(t *testing.T) {
	db := setupWithdrawalTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/withdrawals/bulk", controllers.BulkDeleteWithdrawals)

	// Create a test user with admin role.
	userID := createTestUserForWithdrawal(t, db, "bulkwithdrawal@example.com", "Bulk Withdrawal", "admin", "dummy")
	claims := createTestClaimsForWithdrawal(userID.String(), "admin")

	// Create two withdrawal records.
	var ids []string
	for i := 0; i < 2; i++ {
		withdrawal := models.Withdrawal{
			ID:         uuid.New(),
			CampaignID: uuid.New(),
			Amount:     float64(40 * (i + 1)),
			Status:     "pending",
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := db.Create(&withdrawal).Error; err != nil {
			t.Fatalf("failed to create withdrawal: %v", err)
		}
		ids = append(ids, withdrawal.ID.String())
	}

	// Prepare bulk delete payload.
	payload := map[string]interface{}{
		"ids": ids,
	}
	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodDelete, "/withdrawals/bulk", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.BulkDeleteWithdrawals(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if resp["message"] != "Withdrawals deleted successfully" {
		t.Errorf("unexpected message: %v", resp["message"])
	}

	// Verify deletion from the DB.
	var count int64
	db.Model(&models.Withdrawal{}).Where("id IN ?", ids).Count(&count)
	if count != 0 {
		t.Errorf("expected 0 withdrawals, got %d", count)
	}
}

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

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupNotificationTestDB connects to the test PostgreSQL database, migrates the Notification model, and truncates the table.
func setupNotificationTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	// Migrate the Notification model.
	if err := db.AutoMigrate(&models.Notification{}); err != nil {
		t.Fatalf("failed to migrate Notification model: %v", err)
	}

	// Clean up notifications table.
	db.Exec("TRUNCATE TABLE notifications RESTART IDENTITY CASCADE")

	// Assign the test DB globally.
	utils.DB = db
	return db
}

// createTestUserForNotification creates a test user and returns its ID.
func createTestUserForNotification(t *testing.T, db *gorm.DB, email, fullName, role, password string) uuid.UUID {
	uid := uuid.New()
	var passwordHash string
	if password != "" {
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
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}
	return uid
}

// createTestClaimsForNotification creates dummy JWT claims for testing.
func createTestClaimsForNotification(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
	}
}

// TestCreateNotification tests the CreateNotification controller.
func TestCreateNotification(t *testing.T) {
	db := setupNotificationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/notifications", controllers.CreateNotification)

	// Create a test user.
	userID := createTestUserForNotification(t, db, "notifuser@example.com", "Notif User", "campaign_creator", "dummy")
	claims := createTestClaimsForNotification(userID.String(), "campaign_creator")

	// Prepare the request payload.
	payload := map[string]string{
		"type":    "campaign_update",
		"content": "Your campaign has been updated.",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("failed to marshal payload: %v", err)
	}

	req, err := http.NewRequest(http.MethodPost, "/notifications", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.CreateNotification(c)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	// Verify that the notification was created.
	var notification models.Notification
	if err := db.Where("content = ?", "Your campaign has been updated.").First(&notification).Error; err != nil {
		t.Errorf("failed to create notification in DB: %v", err)
	}
}

// TestGetNotificationByID tests retrieving a notification by its ID.
func TestGetNotificationByID(t *testing.T) {
	db := setupNotificationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/notifications/:id", controllers.GetNotificationByID)

	// Create a test notification.
	testUserID := uuid.New().String()
	notification := models.Notification{
		ID:        uuid.New(),
		UserID:    uuid.MustParse(testUserID),
		Type:      "new_donation",
		Content:   "You have a new donation",
		IsRead:    false,
		Status:    "unread",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := db.Create(&notification).Error; err != nil {
		t.Fatalf("failed to create notification: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/notifications/"+notification.ID.String(), nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	notifData, ok := resp["notification"].(map[string]interface{})
	if !ok {
		t.Fatalf("notification data not in expected format")
	}

	if notifData["Content"] != notification.Content {
		t.Errorf("expected content %v, got %v", notification.Content, notifData["Content"])
	}
}

// TestListNotificationsByUser tests listing notifications for the authenticated user.
func TestListNotificationsByUser(t *testing.T) {
	db := setupNotificationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/notifications", controllers.ListNotificationsByUser)

	// Create a test user.
	userID := createTestUserForNotification(t, db, "listnotif@example.com", "List Notif", "campaign_creator", "dummy")
	claims := createTestClaimsForNotification(userID.String(), "campaign_creator")

	// Create two notifications for this user.
	notif1 := models.Notification{
		ID:        uuid.New(),
		UserID:    uuid.MustParse(userID.String()),
		Type:      "campaign_update",
		Content:   "Campaign update 1",
		IsRead:    false,
		Status:    "unread",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	notif2 := models.Notification{
		ID:        uuid.New(),
		UserID:    uuid.MustParse(userID.String()),
		Type:      "new_donation",
		Content:   "New donation received",
		IsRead:    false,
		Status:    "unread",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := db.Create(&notif1).Error; err != nil {
		t.Fatalf("failed to create notification 1: %v", err)
	}
	if err := db.Create(&notif2).Error; err != nil {
		t.Fatalf("failed to create notification 2: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/notifications", nil)
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.ListNotificationsByUser(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	notifications, ok := resp["notifications"].([]interface{})
	if !ok {
		t.Fatalf("expected notifications to be an array")
	}
	if len(notifications) != 2 {
		t.Errorf("expected 2 notifications, got %d", len(notifications))
	}
}

// TestUpdateNotificationByID tests updating a notification.
func TestUpdateNotificationByID(t *testing.T) {
	db := setupNotificationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.PUT("/notifications/:id", controllers.UpdateNotificationByID)

	// Create a test user.
	userID := createTestUserForNotification(t, db, "updatenotif@example.com", "Update Notif", "campaign_creator", "dummy")
	claims := createTestClaimsForNotification(userID.String(), "campaign_creator")

	// Create a notification.
	notification := models.Notification{
		ID:        uuid.New(),
		UserID:    uuid.MustParse(userID.String()),
		Type:      "campaign_update",
		Content:   "Original content",
		IsRead:    false,
		Status:    "unread",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := db.Create(&notification).Error; err != nil {
		t.Fatalf("failed to create notification: %v", err)
	}

	// Prepare update payload.
	updatePayload := map[string]interface{}{
		"content": "Updated content",
		"is_read": true,
		"status":  "read",
	}
	jsonPayload, _ := json.Marshal(updatePayload)
	req, _ := http.NewRequest(http.MethodPut, "/notifications/"+notification.ID.String(), bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	c.Params = gin.Params{{Key: "id", Value: notification.ID.String()}}

	controllers.UpdateNotificationByID(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	updatedNotif, ok := resp["notification"].(map[string]interface{})
	if !ok {
		t.Fatalf("invalid notification data in response")
	}
	if updatedNotif["Content"] != "Updated content" {
		t.Errorf("expected content 'Updated content', got %v", updatedNotif["Content"])
	}

	// Test update as non-owner should be forbidden.
	otherUserID := uuid.New().String()
	otherClaims := createTestClaimsForNotification(otherUserID, "campaign_creator")
	req, _ = http.NewRequest(http.MethodPut, "/notifications/"+notification.ID.String(), bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr = httptest.NewRecorder()
	c, _ = gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", otherClaims)
	c.Params = gin.Params{{Key: "id", Value: notification.ID.String()}}

	controllers.UpdateNotificationByID(c)

	if rr.Code != http.StatusForbidden {
		t.Errorf("expected status %d for non-owner update, got %d", http.StatusForbidden, rr.Code)
	}
}

// TestBulkDeleteNotifications tests the bulk deletion of notifications.
func TestBulkDeleteNotifications(t *testing.T) {
	db := setupNotificationTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/notifications/bulk", controllers.BulkDeleteNotifications)

	// Create a test user.
	userID := createTestUserForNotification(t, db, "bulknotif@example.com", "Bulk Notif", "campaign_creator", "dummy")
	claims := createTestClaimsForNotification(userID.String(), "campaign_creator")

	// Create two notifications for the user.
	var ids []string
	for i := 0; i < 2; i++ {
		notif := models.Notification{
			ID:        uuid.New(),
			UserID:    uuid.MustParse(userID.String()),
			Type:      "campaign_update",
			Content:   "Bulk delete test " + strconv.Itoa(i),
			IsRead:    false,
			Status:    "unread",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := db.Create(&notif).Error; err != nil {
			t.Fatalf("failed to create notification: %v", err)
		}
		ids = append(ids, notif.ID.String())
	}

	// Prepare bulk delete payload.
	payload := map[string]interface{}{
		"ids": ids,
	}
	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodDelete, "/notifications/bulk", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.BulkDeleteNotifications(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if resp["message"] != "Notifications deleted successfully" {
		t.Errorf("unexpected message: %v", resp["message"])
	}

	// Verify deletion from the DB.
	var count int64
	db.Model(&models.Notification{}).Where("user_id = ?", userID).Count(&count)
	if count != 0 {
		t.Errorf("expected 0 notifications, got %d", count)
	}
}

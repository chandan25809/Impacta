package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	// "strconv"
	"golang.org/x/crypto/bcrypt"
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

// setupCommentTestDB initializes the test database and runs AutoMigrate for User and Comment models.
func setupCommentTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// Migrate the models needed for comment tests.
	if err := db.AutoMigrate(&models.User{}, &models.Comment{}); err != nil {
		t.Fatalf("failed to migrate models: %v", err)
	}

	// Clean up tables before each test.
	db.Exec("TRUNCATE TABLE comments RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")

	// Assign test DB to utils.DB so controllers use it.
	utils.DB = db
	return db
}

// createTestUser creates a user for testing purposes and returns its ID.
func createTestUser(db *gorm.DB, email, fullName, role, password string) uuid.UUID {
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

// createTestClaims creates a dummy claims object for testing.
func createTestClaims(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
		// Add additional fields if necessary.
	}
}

// TestCreateComment tests the CreateComment controller.
func TestCreateComment(t *testing.T) {
	db := setupCommentTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/comments", controllers.CreateComment)

	// Create a test user and corresponding JWT claims.
	userID := createTestUser(db, "commenter@example.com", "Commenter", "donor", "dummy")
	claims := createTestClaims(userID.String(), "donor")

	// Prepare request payload.
	payload := map[string]string{
		"campaign_id": uuid.New().String(), // For testing, we use a random campaign ID.
		"content":     "This is a test comment.",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "/comments", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Create test Gin context, inject claims.
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	// Call controller.
	controllers.CreateComment(c)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}
}

// TestGetComment tests retrieving a single comment.
func TestGetComment(t *testing.T) {
	db := setupCommentTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/comments/:id", controllers.GetComment)

	// First, create a comment directly in the DB.
	campaignID := uuid.New()
	userID := createTestUser(db, "getcomment@example.com", "Get Comment User", "donor", "")
	comment := models.Comment{
		ID:         uuid.New(),
		CampaignID: campaignID,
		UserID:     userID,
		Content:    "A comment to retrieve.",
		Status:     "active",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&comment).Error; err != nil {
		t.Fatalf("failed to create comment: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/comments/"+comment.ID.String(), nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Optionally, decode the JSON response to verify content.
	var gotComment models.Comment
	if err := json.Unmarshal(rr.Body.Bytes(), &gotComment); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if gotComment.Content != "A comment to retrieve." {
		t.Errorf("expected comment content to match, got %s", gotComment.Content)
	}
}

// TestListCommentsByCampaignID tests listing comments for a given campaign.
func TestListCommentsByCampaignID(t *testing.T) {
	db := setupCommentTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/campaigns/:campaign_id/comments", controllers.ListCommentsByCampaignID)

	// Create test user.
	userID := createTestUser(db, "listuser@example.com", "List User", "donor", "")
	// Create test comments associated with a specific campaign.
	campaignID := uuid.New()
	commentsData := []string{"First comment", "Second comment", "Third comment"}
	for i, content := range commentsData {
		comment := models.Comment{
			ID:         uuid.New(),
			CampaignID: campaignID,
			UserID:     userID,
			Content:    content,
			Status:     "active",
			CreatedAt:  time.Now().Add(time.Duration(i) * time.Minute),
			UpdatedAt:  time.Now().Add(time.Duration(i) * time.Minute),
		}
		if err := db.Create(&comment).Error; err != nil {
			t.Fatalf("failed to create comment: %v", err)
		}
	}

	url := "/campaigns/" + campaignID.String() + "/comments"
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Decode response to check number of comments returned.
	var resp map[string][]models.Comment
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if len(resp["comments"]) != len(commentsData) {
		t.Errorf("expected %d comments, got %d", len(commentsData), len(resp["comments"]))
	}
}

// TestListCommentsByUserID tests listing comments by a given user.
func TestListCommentsByUserID(t *testing.T) {
	db := setupCommentTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/users/:user_id/comments", controllers.ListCommentsByUserID)

	// Create test user.
	userID := createTestUser(db, "usercomments@example.com", "User Comments", "donor", "")
	// Create comments for this user.
	commentsData := []string{"User comment 1", "User comment 2"}
	for _, content := range commentsData {
		comment := models.Comment{
			ID:         uuid.New(),
			CampaignID: uuid.New(),
			UserID:     userID,
			Content:    content,
			Status:     "active",
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := db.Create(&comment).Error; err != nil {
			t.Fatalf("failed to create comment: %v", err)
		}
	}

	url := "/users/" + userID.String() + "/comments"
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp []models.Comment
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if len(resp) != len(commentsData) {
		t.Errorf("expected %d comments, got %d", len(commentsData), len(resp))
	}
}

// TestUpdateComment tests updating a comment.
func TestUpdateComment(t *testing.T) {
	db := setupCommentTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.PUT("/comments/:id", controllers.UpdateComment)

	// Create test user.
	userID := createTestUser(db, "updatecomment@example.com", "Update Comment", "donor", "")
	claims := createTestClaims(userID.String(), "donor")

	// Create a comment.
	comment := models.Comment{
		ID:         uuid.New(),
		CampaignID: uuid.New(),
		UserID:     userID,
		Content:    "Original comment",
		Status:     "active",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&comment).Error; err != nil {
		t.Fatalf("failed to create comment: %v", err)
	}

	// Prepare update payload.
	payload := map[string]string{
		"content": "Updated comment content",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPut, "/comments/"+comment.ID.String(), bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	// Create a Gin context and set request, claims, and route parameters.
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	// Set the route parameter "id" manually.
	c.Params = gin.Params{{Key: "id", Value: comment.ID.String()}}

	controllers.UpdateComment(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Verify update in DB.
	var updatedComment models.Comment
	if err := db.Where("id = ?", comment.ID).First(&updatedComment).Error; err != nil {
		t.Fatalf("failed to fetch updated comment: %v", err)
	}
	if updatedComment.Content != "Updated comment content" {
		t.Errorf("expected content to be updated, got %s", updatedComment.Content)
	}
}

// TestDeleteComment tests deleting a comment.
func TestDeleteComment(t *testing.T) {
	db := setupCommentTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/comments/:id", controllers.DeleteComment)

	// Create test user.
	userID := createTestUser(db, "deletecomment@example.com", "Delete Comment", "donor", "")
	claims := createTestClaims(userID.String(), "donor")

	// Create a comment.
	comment := models.Comment{
		ID:         uuid.New(),
		CampaignID: uuid.New(),
		UserID:     userID,
		Content:    "Comment to delete",
		Status:     "active",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&comment).Error; err != nil {
		t.Fatalf("failed to create comment: %v", err)
	}

	req, _ := http.NewRequest(http.MethodDelete, "/comments/"+comment.ID.String(), nil)
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	// Set the route parameter "id" manually.
	c.Params = gin.Params{{Key: "id", Value: comment.ID.String()}}

	controllers.DeleteComment(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Check that the comment is removed from the database.
	var count int64
	db.Model(&models.Comment{}).Where("id = ?", comment.ID).Count(&count)
	if count != 0 {
		t.Error("comment was not deleted from the database")
	}
}

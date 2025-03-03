package controllers_test

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"backend/controllers"
	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupTestDB initializes a PostgreSQL database connection for testing,
// and runs AutoMigrate to create necessary tables.
func setupTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// Migrate the models required by your controllers.
	// This will create the tables in the test database.
	if err := db.AutoMigrate(&models.User{}); err != nil {
		t.Fatalf("failed to migrate User model: %v", err)
	}
	// Migrate additional models if needed:
	// db.AutoMigrate(&models.Campaign{}, &models.Donation{}, &models.Comment{})

	// Assign the test DB to utils.DB so that your controllers use it.
	utils.DB = db

	// Optional: clean up the table before tests run.
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
	return db
}

// TestRegisterUser_NewUser tests registering a new user.
func TestRegisterUser_NewUser(t *testing.T) {
	db := setupTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/register", controllers.RegisterUser)

	payload := map[string]string{
		"email":     "test@example.com",
		"password":  "secret123",
		"full_name": "Test User",
		"role":      "campaign_creator",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	// Expect HTTP 201 Created for a new user registration.
	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	// Check that the user is present in the test DB.
	var user models.User
	if err := db.Where("email = ?", "test@example.com").First(&user).Error; err != nil {
		t.Errorf("user was not created in DB: %v", err)
	}
}

// TestRegisterUser_ExistingUser tests when a user with the given email already exists.
func TestRegisterUser_ExistingUser(t *testing.T) {
	db := setupTestDB(t)

	// Create an initial user in the test DB.
	password, _ := bcrypt.GenerateFromPassword([]byte("secret123"), bcrypt.DefaultCost)
	user := models.User{
		Email:        "test@example.com",
		FullName:     "Test User",
		Role:         "campaign_creator",
		Status:       "active",
		PasswordHash: string(password),
	}
	db.Create(&user)

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/register", controllers.RegisterUser)

	// Prepare payload with the same email.
	payload := map[string]string{
		"email":     "test@example.com",
		"password":  "secret123",
		"full_name": "Test User",
		"role":      "campaign_creator",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	// Expect HTTP 200 OK because the user is already registered.
	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	// Decode response and check that a token is returned.
	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if _, ok := resp["token"]; !ok {
		t.Error("expected token in response, but none found")
	}
}

// TestLoginUser tests the LoginUser controller.
func TestLoginUser(t *testing.T) {
	db := setupTestDB(t)
	// Pre-create a user.
	password, _ := bcrypt.GenerateFromPassword([]byte("secret123"), bcrypt.DefaultCost)
	user := models.User{
		Email:        "login@example.com",
		FullName:     "Login User",
		Role:         "campaign_creator",
		Status:       "active",
		PasswordHash: string(password),
	}
	db.Create(&user)

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/login", controllers.LoginUser)

	payload := map[string]string{
		"email":    "login@example.com",
		"password": "secret123",
	}
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if _, ok := resp["token"]; !ok {
		t.Error("expected token in response, but none found")
	}
}

// Example test for GetUser (protected route).
func TestGetUser(t *testing.T) {
	db := setupTestDB(t)

	// Create a test user.
	user := models.User{
		ID:       uuid.New(),
		Email:    "getuser@example.com",
		FullName: "Get User",
		Role:     "campaign_creator",
		Status:   "active",
	}
	db.Create(&user)

	// Simulate JWT claims. Adjust the structure according to your utils.Claims.
	testClaims := &utils.Claims{
		UserID: user.ID.String(),
		Email:  user.Email,
		Role:   user.Role,
	}

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/user", controllers.GetUser)

	// Create a test request.
	req, _ := http.NewRequest(http.MethodGet, "/user", nil)
	rr := httptest.NewRecorder()

	// Create a Gin context and inject test claims.
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", testClaims)

	// Call the controller directly.
	controllers.GetUser(c)

	// Based on your controller, you may expect status 201 (or 200).
	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d but got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}
}

// Run tests using: go test -v ./...
func TestMain(m *testing.M) {
	// Optional: Setup global test configurations.
	log.Println("Running tests...")
	code := m.Run()
	os.Exit(code)
}

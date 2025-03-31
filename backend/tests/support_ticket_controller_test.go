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

// setupSupportTicketTestDB connects to the test PostgreSQL database, runs AutoMigrate for the SupportTicket model,
// and truncates its table using the correct table name "supporttickets".
func setupSupportTicketTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	// AutoMigrate the SupportTicket model.
	if err := db.AutoMigrate(&models.SupportTicket{}); err != nil {
		t.Fatalf("failed to migrate SupportTicket model: %v", err)
	}

	// Truncate the table using the actual table name.
	db.Exec("TRUNCATE TABLE supporttickets RESTART IDENTITY CASCADE")

	// Set the global DB instance.
	utils.DB = db
	return db
}

// createTestUserForSupportTicket creates a test user and returns its ID.
func createTestUserForSupportTicket(t *testing.T, db *gorm.DB, email, fullName, role, password string) uuid.UUID {
	uid := uuid.New()
	// Append the uuid to the email to make it unique.
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


// createTestClaimsForSupportTicket returns dummy JWT claims for testing.
func createTestClaimsForSupportTicket(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
	}
}

// TestCreateSupportTicket tests creating a support ticket.
func TestCreateSupportTicket(t *testing.T) {
	db := setupSupportTicketTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/support_tickets", controllers.CreateSupportTicket)

	// Create a test user.
	userID := createTestUserForSupportTicket(t, db, "ticketuser@example.com", "Ticket User", "campaign_creator", "dummy")
	claims := createTestClaimsForSupportTicket(userID.String(), "campaign_creator")

	// Prepare the request payload.
	payload := map[string]string{
		"campaign_id": "", // optional
		"type":        "general_query",
		"priority":    "high",
		"query":       "Need help with my campaign",
		"answer":      "",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("failed to marshal payload: %v", err)
	}

	req, err := http.NewRequest(http.MethodPost, "/support_tickets", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.CreateSupportTicket(c)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if resp["message"] != "Support ticket created successfully" {
		t.Errorf("unexpected message: %v", resp["message"])
	}

	// Verify ticket creation in the DB.
	var ticket models.SupportTicket
	if err := db.Where("query = ?", "Need help with my campaign").First(&ticket).Error; err != nil {
		t.Errorf("failed to create support ticket in DB: %v", err)
	}
}

// TestGetSupportTicketByID tests retrieving a support ticket by its ID.
func TestGetSupportTicketByID(t *testing.T) {
	db := setupSupportTicketTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/support_tickets/:id", controllers.GetSupportTicketByID)

	// Create a support ticket.
	testUserID := uuid.New().String()
	ticket := models.SupportTicket{
		ID:         uuid.New(),
		UserID:     uuid.MustParse(testUserID),
		Type:       "dispute",
		Priority:   "medium",
		Status:     "open",
		Query:      "Issue with campaign funds",
		Answer:     "",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&ticket).Error; err != nil {
		t.Fatalf("failed to create support ticket: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/support_tickets/"+ticket.ID.String(), nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	ticketData, ok := resp["ticket"].(map[string]interface{})
	if !ok {
		t.Fatalf("ticket data not in expected format")
	}
	if ticketData["Query"] != ticket.Query {
		t.Errorf("expected query %v, got %v", ticket.Query, ticketData["Query"])
	}
}

// TestListSupportTickets tests listing support tickets for the authenticated user.
func TestListSupportTickets(t *testing.T) {
	db := setupSupportTicketTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/support_tickets", controllers.ListSupportTickets)

	// Create a test user.
	userID := createTestUserForSupportTicket(t, db, "listsupport@example.com", "List Support", "campaign_creator", "dummy")
	claims := createTestClaimsForSupportTicket(userID.String(), "campaign_creator")

	// Create two support tickets for this user.
	ticket1 := models.SupportTicket{
		ID:         uuid.New(),
		UserID:     uuid.MustParse(userID.String()),
		Type:       "general_query",
		Priority:   "low",
		Status:     "open",
		Query:      "First support ticket query",
		Answer:     "",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	ticket2 := models.SupportTicket{
		ID:         uuid.New(),
		UserID:     uuid.MustParse(userID.String()),
		Type:       "dispute",
		Priority:   "high",
		Status:     "open",
		Query:      "Second support ticket query",
		Answer:     "",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&ticket1).Error; err != nil {
		t.Fatalf("failed to create ticket1: %v", err)
	}
	if err := db.Create(&ticket2).Error; err != nil {
		t.Fatalf("failed to create ticket2: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/support_tickets", nil)
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.ListSupportTickets(c)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	tickets, ok := resp["tickets"].([]interface{})
	if !ok {
		t.Fatalf("expected tickets to be an array")
	}
	if len(tickets) != 2 {
		t.Errorf("expected 2 tickets, got %d", len(tickets))
	}
}

// TestUpdateSupportTicketByID tests updating a support ticket.
func TestUpdateSupportTicketByID(t *testing.T) {
	db := setupSupportTicketTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.PUT("/support_tickets/:id", controllers.UpdateSupportTicketByID)

	// Create a test user.
	userID := createTestUserForSupportTicket(t, db, "updatesupport@example.com", "Update Support", "campaign_creator", "dummy")
	claims := createTestClaimsForSupportTicket(userID.String(), "campaign_creator")

	// Create a support ticket.
	ticket := models.SupportTicket{
		ID:         uuid.New(),
		UserID:     uuid.MustParse(userID.String()),
		Type:       "general_query",
		Priority:   "medium",
		Status:     "open",
		Query:      "Initial support ticket query",
		Answer:     "",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := db.Create(&ticket).Error; err != nil {
		t.Fatalf("failed to create support ticket: %v", err)
	}

	// Prepare update payload.
	updatePayload := map[string]interface{}{
		"priority": "high",
		"status":   "resolved",
		"answer":   "Your issue has been resolved",
	}
	jsonPayload, _ := json.Marshal(updatePayload)
	req, _ := http.NewRequest(http.MethodPut, "/support_tickets/"+ticket.ID.String(), bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	c.Params = gin.Params{{Key: "id", Value: ticket.ID.String()}}

	controllers.UpdateSupportTicketByID(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	updatedTicket, ok := resp["ticket"].(map[string]interface{})
	if !ok {
		t.Fatalf("invalid ticket data in response")
	}
	if updatedTicket["Priority"] != "high" {
		t.Errorf("expected priority 'high', got %v", updatedTicket["Priority"])
	}
	if updatedTicket["Status"] != "resolved" {
		t.Errorf("expected status 'resolved', got %v", updatedTicket["Status"])
	}

	// Test update as non-owner should be forbidden.
	otherUserID := uuid.New().String()
	otherClaims := createTestClaimsForSupportTicket(otherUserID, "campaign_creator")
	req, _ = http.NewRequest(http.MethodPut, "/support_tickets/"+ticket.ID.String(), bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr = httptest.NewRecorder()
	c, _ = gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", otherClaims)
	c.Params = gin.Params{{Key: "id", Value: ticket.ID.String()}}

	controllers.UpdateSupportTicketByID(c)

	if rr.Code != http.StatusForbidden {
		t.Errorf("expected status %d for non-owner update, got %d", http.StatusForbidden, rr.Code)
	}
}

// TestBulkDeleteSupportTickets tests the bulk deletion of support tickets.
func TestBulkDeleteSupportTickets(t *testing.T) {
	db := setupSupportTicketTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/support_tickets/bulk", controllers.BulkDeleteSupportTickets)

	// Create a test user.
	userID := createTestUserForSupportTicket(t, db, "bulksupport@example.com", "Bulk Support", "campaign_creator", "dummy")
	claims := createTestClaimsForSupportTicket(userID.String(), "campaign_creator")

	// Create two support tickets for the user.
	var ids []string
	for i := 0; i < 2; i++ {
		ticket := models.SupportTicket{
			ID:         uuid.New(),
			UserID:     uuid.MustParse(userID.String()),
			Type:       "general_query",
			Priority:   "low",
			Status:     "open",
			Query:      "Bulk delete query " + strconv.Itoa(i),
			Answer:     "",
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := db.Create(&ticket).Error; err != nil {
			t.Fatalf("failed to create support ticket: %v", err)
		}
		ids = append(ids, ticket.ID.String())
	}

	// Prepare bulk delete payload.
	payload := map[string]interface{}{
		"ids": ids,
	}
	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodDelete, "/support_tickets/bulk", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.BulkDeleteSupportTickets(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if resp["message"] != "Support tickets deleted successfully" {
		t.Errorf("unexpected message: %v", resp["message"])
	}

	// Verify deletion from the DB.
	var count int64
	db.Model(&models.SupportTicket{}).Where("user_id = ?", userID).Count(&count)
	if count != 0 {
		t.Errorf("expected 0 support tickets, got %d", count)
	}
}

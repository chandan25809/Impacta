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

// setupPaymentTransactionTestDB connects to the test PostgreSQL database,
// auto-migrates the PaymentTransaction model, and truncates its table using the actual table name.
func setupPaymentTransactionTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Fatal("TEST_DATABASE_URL environment variable is not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	// AutoMigrate the PaymentTransaction model.
	if err := db.AutoMigrate(&models.PaymentTransaction{}); err != nil {
		t.Fatalf("failed to migrate PaymentTransaction model: %v", err)
	}

	// Truncate the table using the actual table name.
	db.Exec("TRUNCATE TABLE paymenttransactions RESTART IDENTITY CASCADE")

	// Set the global DB instance.
	utils.DB = db
	return db
}

// createTestDonationID returns a dummy donation ID for testing.
func createTestDonationID() uuid.UUID {
	return uuid.New()
}

// createTestUserForPayment creates a test user and returns its ID.
// To avoid duplicate email errors, a unique identifier is appended to the email.
func createTestUserForPayment(t *testing.T, db *gorm.DB, email, fullName, role, password string) uuid.UUID {
	uid := uuid.New()
	uniqueEmail := email + "-" + uid.String()
	var passwordHash string
	if password != "" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
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

// createTestClaimsForPayment returns dummy JWT claims for testing.
func createTestClaimsForPayment(userID, role string) *utils.Claims {
	return &utils.Claims{
		UserID: userID,
		Role:   role,
	}
}

// TestCreatePaymentTransaction tests creating a payment transaction.
func TestCreatePaymentTransaction(t *testing.T) {
	db := setupPaymentTransactionTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/payment_transactions", controllers.CreatePaymentTransaction)

	// Use a dummy donation ID.
	donationID := createTestDonationID()

	// Prepare the request payload.
	payload := map[string]interface{}{
		"donation_id":            donationID.String(),
		"gateway":                "Stripe",
		"status":                 "completed",
		"amount":                 100.0,
		"currency":               "USD",
		"gateway_transaction_id": "txn_12345",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("failed to marshal payload: %v", err)
	}
	req, err := http.NewRequest(http.MethodPost, "/payment_transactions", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req

	controllers.CreatePaymentTransaction(c)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusCreated, rr.Code, rr.Body.String())
	}

	// Verify creation in the DB.
	var pt models.PaymentTransaction
	if err := db.Where("gateway_transaction_id = ?", "txn_12345").First(&pt).Error; err != nil {
		t.Fatalf("failed to find payment transaction: %v", err)
	}
	if pt.Amount != 100.0 {
		t.Errorf("expected amount 100.0, got %v", pt.Amount)
	}
}

// TestGetPaymentTransactionByID tests retrieving a payment transaction by its ID.
func TestGetPaymentTransactionByID(t *testing.T) {
	db := setupPaymentTransactionTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/payment_transactions/:id", controllers.GetPaymentTransactionByID)

	pt := models.PaymentTransaction{
		ID:                   uuid.New(),
		DonationID:           createTestDonationID(),
		Gateway:              "PayPal",
		Status:               "pending",
		Amount:               50.0,
		Currency:             "USD",
		GatewayTransactionID: "txn_67890",
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}
	if err := db.Create(&pt).Error; err != nil {
		t.Fatalf("failed to create payment transaction: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/payment_transactions/"+pt.ID.String(), nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	ptData, ok := resp["payment_transaction"].(map[string]interface{})
	if !ok {
		t.Fatalf("payment transaction data not in expected format")
	}
	if ptData["Gateway"] != "PayPal" {
		t.Errorf("expected Gateway 'PayPal', got %v", ptData["Gateway"])
	}
}

// TestListPaymentTransactions tests listing payment transactions, optionally filtering by donation_id.
func TestListPaymentTransactions(t *testing.T) {
	db := setupPaymentTransactionTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/payment_transactions", controllers.ListPaymentTransactions)

	donationID := createTestDonationID()

	// Create two payment transactions with the same donation_id.
	for i := 0; i < 2; i++ {
		pt := models.PaymentTransaction{
			ID:                   uuid.New(),
			DonationID:           donationID,
			Gateway:              "Stripe",
			Status:               "completed",
			Amount:               float64(10 * (i + 1)),
			Currency:             "USD",
			GatewayTransactionID: "txn_list_" + strconv.Itoa(i),
			CreatedAt:            time.Now(),
			UpdatedAt:            time.Now(),
		}
		if err := db.Create(&pt).Error; err != nil {
			t.Fatalf("failed to create payment transaction: %v", err)
		}
	}

	// List with filtering by donation_id.
	url := "/payment_transactions?donation_id=" + donationID.String()
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

	pts, ok := resp["payment_transactions"].([]interface{})
	if !ok {
		t.Fatalf("expected payment_transactions to be an array")
	}
	if len(pts) != 2 {
		t.Errorf("expected 2 payment transactions, got %d", len(pts))
	}
}

// TestUpdatePaymentTransaction tests updating a payment transaction.
// This endpoint is restricted to admin users.
func TestUpdatePaymentTransaction(t *testing.T) {
	db := setupPaymentTransactionTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.PUT("/payment_transactions/:id", controllers.UpdatePaymentTransaction)

	// Create a test user with admin role.
	userID := createTestUserForPayment(t, db, "admin_payment@example.com", "Admin Payment", "admin", "dummy")
	claims := createTestClaimsForPayment(userID.String(), "admin")

	pt := models.PaymentTransaction{
		ID:                   uuid.New(),
		DonationID:           createTestDonationID(),
		Gateway:              "Stripe",
		Status:               "pending",
		Amount:               75.0,
		Currency:             "USD",
		GatewayTransactionID: "txn_update_1",
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}
	if err := db.Create(&pt).Error; err != nil {
		t.Fatalf("failed to create payment transaction: %v", err)
	}

	// Prepare update payload.
	updatePayload := map[string]interface{}{
		"gateway":                "PayPal",
		"status":                 "completed",
		"amount":                 80.0,
		"currency":               "USD",
		"gateway_transaction_id": "txn_update_2",
	}
	jsonPayload, _ := json.Marshal(updatePayload)
	req, _ := http.NewRequest(http.MethodPut, "/payment_transactions/"+pt.ID.String(), bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)
	c.Params = gin.Params{{Key: "id", Value: pt.ID.String()}}

	controllers.UpdatePaymentTransaction(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	updatedPT, ok := resp["payment_transaction"].(map[string]interface{})
	if !ok {
		t.Fatalf("invalid payment transaction data in response")
	}
	if updatedPT["Gateway"] != "PayPal" {
		t.Errorf("expected Gateway 'PayPal', got %v", updatedPT["Gateway"])
	}
	if updatedPT["Status"] != "completed" {
		t.Errorf("expected Status 'completed', got %v", updatedPT["Status"])
	}
	if updatedPT["Amount"].(float64) != 80.0 {
		t.Errorf("expected Amount 80.0, got %v", updatedPT["Amount"])
	}
}

// TestBulkDeletePaymentTransactions tests bulk deletion of payment transactions (admin only).
func TestBulkDeletePaymentTransactions(t *testing.T) {
	db := setupPaymentTransactionTestDB(t)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/payment_transactions/bulk", controllers.BulkDeletePaymentTransactions)

	// Create a test user with admin role.
	userID := createTestUserForPayment(t, db, "bulkpayment@example.com", "Bulk Payment", "admin", "dummy")
	claims := createTestClaimsForPayment(userID.String(), "admin")

	// Create two payment transactions.
	var ids []string
	for i := 0; i < 2; i++ {
		pt := models.PaymentTransaction{
			ID:                   uuid.New(),
			DonationID:           createTestDonationID(),
			Gateway:              "Stripe",
			Status:               "completed",
			Amount:               float64(20 * (i + 1)),
			Currency:             "USD",
			GatewayTransactionID: "txn_bulk_" + strconv.Itoa(i),
			CreatedAt:            time.Now(),
			UpdatedAt:            time.Now(),
		}
		if err := db.Create(&pt).Error; err != nil {
			t.Fatalf("failed to create payment transaction: %v", err)
		}
		ids = append(ids, pt.ID.String())
	}

	// Prepare bulk delete payload.
	payload := map[string]interface{}{
		"ids": ids,
	}
	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodDelete, "/payment_transactions/bulk", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = req
	c.Set("claims", claims)

	controllers.BulkDeletePaymentTransactions(c)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d. Response: %s", http.StatusOK, rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if resp["message"] != "Payment transactions deleted successfully" {
		t.Errorf("unexpected message: %v", resp["message"])
	}

	// Verify deletion from the DB.
	var count int64
	db.Model(&models.PaymentTransaction{}).Where("id IN ?", ids).Count(&count)
	if count != 0 {
		t.Errorf("expected 0 payment transactions, got %d", count)
	}
}

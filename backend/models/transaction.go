package models

import (
	"time"

	"github.com/google/uuid"
)

type PaymentTransaction struct {
	ID                   uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	DonationID           uuid.UUID `gorm:"type:uuid;not null"`
	Gateway              string    `gorm:"type:varchar(50);not null"`
	Status               string    `gorm:"type:varchar(50);not null"` // completed, failed, pending
	Amount               float64   `gorm:"type:numeric(12,2);not null"`
	Currency             string    `gorm:"type:varchar(10);not null"`
	GatewayTransactionID string    `gorm:"type:varchar(255)"`
	CreatedAt            time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt            time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
}

// TableName sets the table name for PaymentTransaction model.
func (PaymentTransaction) TableName() string {
	return "paymenttransactions"
}

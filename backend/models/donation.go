package models

import (
	"time"

	"github.com/google/uuid"
)

type Donation struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CampaignID uuid.UUID `gorm:"type:uuid;not null"`
	DonorID    uuid.UUID `gorm:"type:uuid;not null"`
	Amount     float64   `gorm:"type:numeric(12,2);not null"`
	Currency   string    `gorm:"type:varchar(10);not null"`
	Message    string    `gorm:"type:text"`
	IsAnonymous bool      `gorm:"type:boolean;default:false"`
	Status     string    `gorm:"type:varchar(50);default:'completed'"` // completed, failed, pending
	CreatedAt  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

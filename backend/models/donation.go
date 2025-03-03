// In models/donation.go
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
	IsAnonymous bool     `gorm:"default:false"`
	Status     string    `gorm:"type:varchar(50);default:'completed'"`
	CreatedAt  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`

	// Association to Users table.
	Donor User `gorm:"foreignKey:DonorID;references:ID"`
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type Withdrawal struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CampaignID  uuid.UUID  `gorm:"type:uuid;not null"`
	Amount      float64    `gorm:"type:numeric(12,2);not null"`
	Status      string     `gorm:"type:varchar(50);default:'pending'"` // pending, processed, failed
	ProcessedAt *time.Time `gorm:"type:timestamp"`                     // Nullable
	CreatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
}

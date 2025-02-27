package models

import (
	"time"

	"github.com/google/uuid"
)

type Campaign struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CreatorID     uuid.UUID `gorm:"type:uuid;not null"`
	Title         string    `gorm:"type:varchar(255);not null"`
	Description   string    `gorm:"type:text;not null"`
	TargetAmount  float64   `gorm:"type:numeric(12,2);not null"`
	CurrentAmount float64   `gorm:"type:numeric(12,2);default:0"`
	Deadline      time.Time `gorm:"type:timestamp;not null"`
	Status        string    `gorm:"type:varchar(50);default:'pending'"` // pending, active, completed
	Currency      string    `gorm:"type:varchar(10);not null"`
	Category      string    `gorm:"type:varchar(100);not null"` // New field
	CreatedAt     time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt     time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}


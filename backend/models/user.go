package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email        string    `gorm:"type:varchar(255);unique;not null"`
	PasswordHash string    `gorm:"type:varchar(255);not null"`
	FullName     string    `gorm:"type:varchar(255);not null"`
	Role         string    `gorm:"type:varchar(50);not null"` // campaign_creator, donor, admin
	Status       string    `gorm:"type:varchar(50);default:'active'"` // active, inactive, banned
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email        string    `gorm:"type:varchar(255);not null;unique"`
	PasswordHash string    `gorm:"type:varchar(255);not null"`
	FullName     string    `gorm:"type:varchar(255);not null"`
	Role         string    `gorm:"type:varchar(50);not null"`
	Status       string    `gorm:"type:varchar(50);default:'active'"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
}

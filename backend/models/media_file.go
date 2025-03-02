package models

import (
	"time"

	"github.com/google/uuid"
)

type MediaFile struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CampaignID uuid.UUID `gorm:"type:uuid;not null"`
	FileType  string    `gorm:"type:varchar(50);not null"`
	URL       string    `gorm:"type:varchar(255);not null"`
	Status    string    `gorm:"type:varchar(50);default:'active'"` // active, deleted
	CreatedAt time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

func (MediaFile) TableName() string {
    return "mediafiles"
}
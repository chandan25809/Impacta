package models

import (
	"time"

	"github.com/google/uuid"
)

type Notification struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid;not null"`
	Type      string    `gorm:"type:varchar(50);not null"` // campaign_update, new_donation
	Content   string    `gorm:"type:text;not null"`
	IsRead    bool      `gorm:"type:boolean;default:false"`
	Status    string    `gorm:"type:varchar(50);default:'unread'"` // unread, read, deleted
	CreatedAt time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

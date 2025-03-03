package models

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CampaignID uuid.UUID `gorm:"type:uuid;not null"`
	UserID     uuid.UUID `gorm:"type:uuid;not null"`
	Content    string    `gorm:"type:text;not null"`
	Status     string    `gorm:"type:varchar(50);default:'active'"` // active, deleted
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`

	// Association: Preload the User data for the comment.
	User User `gorm:"foreignKey:UserID;references:ID"`
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type SupportTicket struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID     uuid.UUID `gorm:"type:uuid;not null"`
	CampaignID uuid.UUID `gorm:"type:uuid"` // Nullable for general queries
	Type       string    `gorm:"type:varchar(50);not null"` // dispute, general_query
	Status     string    `gorm:"type:varchar(50);default:'open'"` // open, resolved, closed
	Priority   string    `gorm:"type:varchar(50);not null"` // low, medium, high
	Query      string    `gorm:"type:text"`  // New field for the query
	Answer     string    `gorm:"type:text"`  // New field for the answer
	CreatedAt  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

func (SupportTicket) TableName() string {
	return "supporttickets"
}
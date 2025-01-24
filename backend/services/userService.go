package services

import (
	"backend/models"
	"backend/repositories"
)

func GetUsers() ([]models.User, error) {
	return repositories.GetAllUsers()
}

package repositories

import (
	"backend/models"
	"backend/utils"
	"log"
)

func GetAllUsers() ([]models.User, error) {
	rows, err := utils.DB.Query("SELECT id, name, email FROM users")
	if err != nil {
		log.Println("Error fetching users:", err)
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Name, &user.Email); err != nil {
			log.Println("Error scanning user:", err)
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

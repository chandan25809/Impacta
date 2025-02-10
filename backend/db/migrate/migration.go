package migrate

import (
    "backend/models"
    "backend/utils"
)

func RunMigrations() {
    utils.ConnectDB()

    // Migrate all models
    utils.DB.AutoMigrate(
        &models.User{},
        &models.Campaign{},
        &models.Donation{},
        &models.PaymentTransaction{},
        &models.Comment{},
        &models.MediaFile{},
        &models.Notification{},
        &models.SupportTicket{},
        &models.Withdrawal{},
    )
}

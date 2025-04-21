package utils

import (
	"fmt"
	"net/smtp"
)

// SendEmail sends an email via SMTP.
func SendEmail(to, subject, body string) error {
	// Load SMTP config from env
	host := "smtp.gmail.com"    
	port := "587"       
	username := "shruthireddy1201@gmail.com"  // your SMTP username
	password := "fflo boql osdp yoie"   // your SMTP password

	auth := smtp.PlainAuth("", username, password, host)

	// Build the message
	msg := []byte(
		"From: " + username + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"Mime-Version: 1.0\r\n" +
			"Content-Type: text/html; charset=\"UTF-8\"\r\n" +
			"\r\n" +
			body + "\r\n",
	)

	addr := fmt.Sprintf("%s:%s", host, port)
	return smtp.SendMail(addr, auth, username, []string{to}, msg)
}

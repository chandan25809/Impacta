package routes

import (
	"backend/controllers"
	"net/http"
)

func InitRoutes() *http.ServeMux {
	router := http.NewServeMux()
	router.HandleFunc("/api/users", controllers.GetUsers)
	return router
}

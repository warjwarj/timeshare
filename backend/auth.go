package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type AuthService struct {
	dbconn *DbConn
}

func NewAuthService(dbconn *DbConn) *AuthService {
	return &AuthService{
		dbconn: dbconn,
	}
}

func (as *AuthService) GetRoutes() map[string]func(http.ResponseWriter, *http.Request) {
	return map[string]func(http.ResponseWriter, *http.Request){
		"/register": as.handleRegister(),
		"/login":    as.handleLogin(),
	}
}

func (as *AuthService) handleRegister() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/register" {
			RespondError(w, http.StatusInternalServerError, "Internal server error")
			panic("/register isn't mapped to /register")
		}
		if r.Method != http.MethodPost {
			RespondError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		var dto RegisterDTO
		err := json.NewDecoder(r.Body).Decode(&dto)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println(dto.Email)
		fmt.Println(dto.Pass)
	}
}

func (as *AuthService) handleLogin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/login" {
			RespondError(w, http.StatusInternalServerError, "Internal server error")
			panic("/login isn't mapped to /login")
		}
		if r.Method != http.MethodPost {
			RespondError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		var dto LoginDTO
		err := json.NewDecoder(r.Body).Decode(&dto)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println(dto.Email)
		fmt.Println(dto.Pass)
	}
}

// func doLogin()

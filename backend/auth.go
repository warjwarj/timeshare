package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func handleRegister() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.Method)
		if r.Method != http.MethodPost {
			RespondError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		if r.URL.Path != "/register" {
			RespondError(w, http.StatusInternalServerError, "Internal server error")
			return
		}
		var temp interface{}
		err := json.NewDecoder(r.Body).Decode(&temp)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println(temp)
	}
}
func handleLogin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.Method)
		if r.Method != http.MethodPost {
			RespondError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		if r.URL.Path != "/login" {
			RespondError(w, http.StatusInternalServerError, "Internal server error")
			return
		}
		var temp interface{}
		err := json.NewDecoder(r.Body).Decode(&temp)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println(temp)
	}
}

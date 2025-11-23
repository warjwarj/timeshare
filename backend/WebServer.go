package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"go.uber.org/zap"
)

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// WebServer holds the HTTP server and dependencies
type WebServer struct {
	mux    *http.ServeMux
	server *http.Server
	logger *zap.Logger
}

// NewWebServer creates a new server instance
func NewWebServer(port string, logger *zap.Logger) (*WebServer, error) {

	// create server and map routes
	s := &WebServer{
		mux:    http.NewServeMux(),
		logger: logger,
	}
	s.routes()
	s.server = &http.Server{
		Addr:         ":" + port,
		Handler:      s.middleware(s.mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// return the server
	return s, nil
}

// routes configures all server routes
func (s *WebServer) routes() {
	s.mux.HandleFunc("/", s.handleHome())
	s.mux.HandleFunc("/health", s.handleHealth())
	s.mux.HandleFunc("/api/testevents", s.handleUsers())
}

// middleware wraps the handler with logging and CORS
func (s *WebServer) middleware(next http.Handler) http.Handler {
	return loggingMiddleware(corsMiddleware(next))
}

// Start starts the HTTP server
func (s *WebServer) Start() error {
	s.logger.Info("Server starting on %s", zap.String("", s.server.Addr))
	return s.server.ListenAndServe()
}

// Shutdown gracefully shuts down the server
func (s *WebServer) Shutdown(ctx context.Context) error {
	s.logger.Info("Server shutting down...", zap.String("", s.server.Addr))
	log.Println("Server shutting down...")
	return s.server.Shutdown(ctx)
}

// Handler functions
func (s *WebServer) handleHome() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		respondJSON(w, http.StatusOK, Response{
			Success: true,
			Message: "Welcome to the API",
		})
	}
}

func (s *WebServer) handleHealth() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		respondJSON(w, http.StatusOK, Response{
			Success: true,
			Message: "Server is healthy",
			Data: map[string]string{
				"status": "up",
				"time":   time.Now().Format(time.RFC3339),
			},
		})
	}
}

func (s *WebServer) handleUsers() http.HandlerFunc {
	type user struct {
		ID    int    `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			users := []user{
				{ID: 1, Name: "John Doe", Email: "john@example.com"},
				{ID: 2, Name: "Jane Smith", Email: "jane@example.com"},
			}

			respondJSON(w, http.StatusOK, Response{
				Success: true,
				Data:    users,
			})

		case http.MethodPost:
			s.handleCreateUser(w, r)

		default:
			respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		}
	}
}

func (s *WebServer) handleUserByID() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		// Extract ID from path: /api/users/{id}
		path := strings.TrimPrefix(r.URL.Path, "/api/users/")
		if path == "" {
			respondError(w, http.StatusBadRequest, "User ID is required")
			return
		}

		respondJSON(w, http.StatusOK, Response{
			Success: true,
			Data: map[string]string{
				"id":    path,
				"name":  "John Doe",
				"email": "john@example.com",
			},
		})
	}
}

func (s *WebServer) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	type createUserRequest struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	var req createUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" || req.Email == "" {
		respondError(w, http.StatusBadRequest, "Name and email are required")
		return
	}

	respondJSON(w, http.StatusCreated, Response{
		Success: true,
		Message: "User created successfully",
		Data: map[string]interface{}{
			"id":    3,
			"name":  req.Name,
			"email": req.Email,
		},
	})
}

// Middleware
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.RequestURI, time.Since(start))
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Helper functions
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, Response{
		Success: false,
		Message: message,
	})
}

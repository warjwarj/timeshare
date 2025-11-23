package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
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
	s.mux.HandleFunc("/api/testevents", s.handleTestEvents())
}

// apply middleware to the http handler
func (s *WebServer) middleware(next http.Handler) http.Handler {
	return loggingMiddleware(corsMiddleware(next))
}

// start server
func (s *WebServer) Start() error {
	s.logger.Info("Server starting on %s", zap.String("", s.server.Addr))
	return s.server.ListenAndServe()
}

// shutdown server through context
func (s *WebServer) Shutdown(ctx context.Context) error {
	s.logger.Info("Server shutting down...", zap.String("", s.server.Addr))
	log.Println("Server shutting down...")
	return s.server.Shutdown(ctx)
}

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~
	Route handlers
~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

type EventDTO struct {
	Key    string    `json:"key"`
	ID     string    `json:"id"`
	Start  time.Time `json:"start"` // event start
	End    time.Time `json:"end"`   // inclusive
	Title  string    `json:"title"`
	Colour string    `json:"colour"`
}

func (s *WebServer) handleTestEvents() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/testevents" {
			http.NotFound(w, r)
			return
		}

		byts, err := os.ReadFile("testevents.json")
		if err != nil {
			s.logger.Error("couldn't read json file ", zap.Error(err))
		}

		respondJSON(w, http.StatusOK, Response{
			Success: true,
			Message: string(byts),
		})
	}
}

func (s *WebServer) handleHome() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		respondJSON(w, http.StatusOK, Response{
			Success: true,
			Message: "api active ^_^",
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

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~
	Middleware
~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

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

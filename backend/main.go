package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"
)

func main() {

	// logger
	var logger *zap.Logger
	if PROD {
		tmp, err := zap.NewProduction()
		if err != nil {
			panic(fmt.Errorf("fatal error initing logger: %v", err))
		}
		logger = tmp
	} else {
		tmp, err := zap.NewDevelopment()
		if err != nil {
			panic(fmt.Errorf("fatal error initing logger: %v", err))
		}
		logger = tmp
	}
	defer logger.Sync()

	// instatiate server
	server, err := NewWebServer(PORT, logger)
	if err != nil {
		logger.Fatal("fatal error creating server: ", zap.Error(err))
	}
	// channel for shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	// start server async
	go func() {
		if err := server.Start(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("server failed to start: ", zap.Error(err))
		}
	}()
	logger.Info("server started successfully")

	// block until interrupt
	<-done
	logger.Info("server stopping...")

	// shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("server died ＞︿＜: ", zap.Error(err))
	}
	log.Println("server stopped")
}

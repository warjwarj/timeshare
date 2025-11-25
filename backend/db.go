package main

import (
	"context"

	"github.com/jackc/pgx/v5"
	"go.uber.org/zap"
)

type DbConn struct {
	logger *zap.Logger
	conn   *pgx.Conn
}

func NewDbConn(connstr string, logger *zap.Logger) (*DbConn, error) {

	// urlExample := "postgres://username:password@localhost:5432/database_name"
	conn, err := pgx.Connect(context.Background(), connstr)
	if err != nil {
		logger.Fatal("Unable to connect to database: %v\n", zap.Error(err))
		return nil, err
	}
	dbc := &DbConn{
		conn:   conn,
		logger: logger,
	}
	return dbc, nil
}

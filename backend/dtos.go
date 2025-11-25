package main

import "time"

type EventDTO struct {
	Key    string    `json:"key"`
	ID     string    `json:"id"`
	Start  time.Time `json:"start"` // event start
	End    time.Time `json:"end"`   // inclusive
	Title  string    `json:"title"`
	Colour string    `json:"colour"`
}

type RegisterDTO struct {
	Email string `json:"Email"`
	Pass  string `json:"Pass"`
	Name  string `json:"Name"`
}

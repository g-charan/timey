package main

import (
	"database/sql" // The standard Go library for database interaction
	"fmt"          // For printing messages to the screen
	"log"          // For logging errors
	"net/url"      // Used to safely build the connection URL
	"os"           // Used to read environment variables

	"github.com/joho/godotenv"         // The package to read .env files
	_ "github.com/jackc/pgx/v5/stdlib" // The PostgreSQL driver we just installed
)

func main() {
	// Step 1: Load environment variables from a .env file
	err := godotenv.Load()
	if err != nil {
		// This is not a fatal error, as env vars can be set in the OS
		log.Println("Note: .env file not found, reading from OS environment variables")
	}

	// Step 2: Get database credentials from environment variables
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD") // The raw password, without encoding
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	// Step 3: Build the connection string safely
	// This structure handles special characters in your password automatically
	connectionURL := &url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(dbUser, dbPassword),
		Host:     fmt.Sprintf("%s:%s", dbHost, dbPort),
		Path:     dbName,
		RawQuery: "sslmode=disable",
	}
	connStr := connectionURL.String()

	// Step 4: Prepare the call (sql.Open)
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatalf("Unable to open database connection: %v\n", err)
	}
	// This line makes sure we hang up the call when we're done.
	defer db.Close()

	// Step 5: Make the actual call (db.Ping)
	err = db.Ping()
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	// If we get here, it means we connected successfully!
	fmt.Println("Successfully connected to the database! 🎉")
}



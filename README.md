# Book Management System

## Overview

This is a simple Book Management System built with Node.js, Express.js, PostgreSQL, and EJS templates. It allows users to keep track of their reading list, add new books, edit existing ones, and delete books. Additionally, users can write notes for each book they've read.

## Demo

https://goodbooks-zivf.onrender.com/

*The website requires up to 20s to load, due to free hosting of the back-end part.

## Features

- **Add Books**: Users can add new books to their reading list, providing details such as title, author, genre, description, and notes.
- **Edit Books**: Users can edit existing book details or notes.
- **Delete Books**: Users can delete books from their reading list.
- **View Notes**: Users can view the notes they've written for each book.
- **Search**: Users can search for books by title, author, or genre.
- **Sort**: Users can sort their reading list by recency of reading or by rating.

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Pullsard/goodbooks.git

2.  **Navigate to the project directory**:
    cd book-management-system

3. **Install the dependencies**:
    npm install

4. **Set up PostgreSQL:**:
    1. Create a PostgreSQL database.
    2. Set up your environment variables by creating a .env file in the root directory with the following variables:
        PG_USER=your_username
        PG_PASSWORD=your_password
        PG_HOST=your_host
        PG_DATABASE=your_database
        PG_PORT=your_port

5. **Start the server**:
    nodemon index.js or
    node index.js

6. **Open your browser and go to http://localhost:3000 to view the application.**

### Dependencies
Express: Web framework for Node.js.
pg: PostgreSQL client for Node.js.
axios: Promise-based HTTP client for making requests to external APIs.
dotenv: Loads environment variables from a .env file into process.env.
body-parser: Middleware for parsing incoming request bodies.

#### Folder Structure
public: Contains static assets like CSS, images, and client-side JavaScript.
views: Contains EJS templates for rendering HTML.




import pg from "pg";
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

//database initiation, using .env for hiding the sensible data
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
db.connect();

app.use(express.static("public"));//settin the path relative tot he public folder
app.use(bodyParser.urlencoded({extended:true}));

//the home/index route, usig get request
app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = book_id");
    const books = result.rows;
    res.render("index.ejs", {books:books});
});


//the add route, which renders a new page, where one can add a new book(this route just gets the page)
app.get("/add", (req, res) => {
    res.render("add.ejs");
});

//the add route, with POST method, where one can insert the data for the new book 
app.post("/add", async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const genre = req.body.genre;
    const date = req.body.date;
    const rating = req.body.rating;
    const description = req.body.description;
    const notes = req.body.notes;

    const query = await axios.get(`https://openlibrary.org/search.json?title= ${title}&author_name=${author}`);//get http request for getting a json object with the data needed
    const result = query.data.docs[0].edition_key; //from the json that we got above, we got a specific json object, with keys
    //using keys we search for a valid result(an existing book cover from the api)
    let olid ="";
    for(olid of result){
        try{//if we find a cover with this olid, then whe assign this value to the olid, which will be inserted in the database
            await axios.get(`https://covers.openlibrary.org/b/olid/${olid}-M.jpg?default=false`);
            olid = olid;
            break;
        } catch(err) {//if the cover for that specific olid is not found, we go further in searching, until the first valid result
            console.error(`Cover with image: ${olid} not found`, err);
            continue;
        }
    }
    //inserting data from the inputs to the database
    const data = await db.query("INSERT INTO books (title, author, genre, description, lccn) VALUES($1,$2,$3,$4, $5) RETURNING id",[title,author,genre,description,olid]);
    const book_id = parseInt(data.rows[0].id);
    
    await db.query("INSERT INTO notes (read_date, rating,notes, book_id) VALUES ($1, $2, $3, $4)",[date, rating, notes, book_id]);
    
    res.redirect("/");
});

//this route reders the edit page, with a specific endpoint, which is the id of the book wanted to edit
app.get("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id);
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = book_id WHERE books.id = $1 ",[id]);//getting the data from database for inserting it to the new page rendered, so that the user could edit it
    const books = result.rows[0];
    res.render("edit.ejs", {books: books});
});

//post request, for changing the info in the databases, based by the edits made by the user
app.post("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await db.query("SELECT * FROM books JOIN notes ON books.id = book_id WHERE books.id = $1 ",[id]);
    const rows = data.rows[0];
    const title = req.body.title || rows.title;
    const author = req.body.author || rows.author;
    const read_date =  req.body.date || rows.date;
    const genre = req.body.genre || rows.genre;
    const description = req.body.description || rows.description;
    const notes = req.body.notes || rows.notes;
    const rating = req.body.rating || rows.rating;
    //updating the database with the new values
    await db.query("UPDATE books SET title=$1, author=$2, genre=$3, description=$4 WHERE id= $5",[title, author, genre, description, id]);
    await db.query("UPDATE notes SET read_date=$1, rating=$2, notes=$3 WHERE book_id=$4",[read_date, rating, notes, id]);
    res.redirect("/");

});

//deleting a book by it's id( which is specified also in the index.ejs)
app.post("/delete", async (req, res) => {
    const id = parseInt(req.body.id);//the id is got from the index.ejs hidden input
    await db.query("DELETE FROM notes WHERE book_id = $1", [id]);
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");

});

//sorting the main page by the most recent  book that have been read
app.post("/recency", async (req, res) => {
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = book_id ORDER BY read_date DESC");
    const books = result.rows;
    res.render("index.ejs", {books: books});
});

//sorting the main page based by the hrating, in ascending order
app.post("/rating", async (req, res) => {
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = book_id ORDER BY rating ASC");
    const books = result.rows;
    res.render("index.ejs", {books: books});
});

//rendering a notes pages, based by the id got from the hidden input in the index.ejs, which shows us a new page, where one can read the notes made for that specific book 
app.get("/notes/:id", async (req, res) => {//id endpoint for getting speciifc book's notes
    const id = parseInt(req.params.id);
    const data = await db.query("SELECT * FROM books JOIN notes ON books.id = book_id WHERE books.id=$1",[id]);//selecting the notes from database, based on the id input
    const books = data.rows[0];
    console.log(books);
    res.render("notes.ejs", {books:books});
});


//search route for finding from the books added a specific title/author or genre
app.post("/search", async (req,res) => {
    const input = req.body.search;
    try{
        const data = await db.query("SELECT * FROM books JOIN notes ON books.id=book_id WHERE LOWER(title) LIKE '%' || $1 || '%' OR LOWER(author) LIKE '%' || $1 || '%' OR LOWER(genre) LIKE '%' || $1 || '%'; ",[input.toLowerCase()]);
        const books = data.rows;
        console.log(books);
        res.render("index.ejs", {books : books});
    } catch(err) {
        console.log(err);
        res.redirect("/")
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.listen(port, () =>{
    console.log(`The server is running on port ${port}.`);
});
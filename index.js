import pg from "pg";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
const app = express();
const port = 3000;
//app is set to see the file in ejs
app.set("view engine", "ejs");
//middleware functions are used by the app for maintaining the contact between the front end and the back end(mediators)
app.use(express.urlencoded({ extended: true }));//helps to use the https protocols to encode website path
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));//data will be encoded as well

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "Aishacodes@893210",
    port: 5432,
});
db.connect();
//REST APIs GET POST PUT DELETE

app.get("/", async (req, res) => {
    try {
        const response = await db.query("SELECT * FROM readbooks");
        console.log("User data:", response.rows);
        console.log("The size of the response data is:", response.rows.length);

        const result = [];
        const des_result= [];
        for (let i = 0; i < response.rows.length; i++) {
            const isbn = response.rows[i].isbn;
            const bookInfo = await fetchBookInfo(isbn);
            if (bookInfo && bookInfo.thumbnailUrl) {
                result.push(bookInfo.thumbnailUrl);
                des_result.push(bookInfo.description);
            }
        }
        res.render("index", { joke: result,review: des_result});
        console.log(result);
        console.log(des_result);
    } catch (err) {
        console.log("Error in executing query", err.stack);
        res.status(500).send("Error occurred while fetching book data.");
    } finally {
        db.end();
    }
});

async function fetchBookInfo(isbn) {
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const bookData = response.data;
        if (bookData.totalItems > 0) {
            const book = bookData.items[0].volumeInfo;
            if (book.imageLinks && book.imageLinks.thumbnail) {
                return { thumbnailUrl: book.imageLinks.thumbnail, 
                description: book.description
            };
            }
        }
        return null; // No book cover available
    } catch (error) {
        console.error('Error fetching book info:', error);
        return null;
    }
}



app.listen(port, () => {
    console.log("The server is running at " + port);
});

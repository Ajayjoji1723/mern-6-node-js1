const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const port = 4444;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtAuth = require("./middlewares/jwtAuth"); //middleware for jwt verifiication

const dbPath = path.join(__dirname, "goodreads.db");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`DB Connected\nServer Running at ${port}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//get all books from goodreads DB
app.get("/books",jwtAuth, async (req, res) => {
  try {
    let getBooksQuery = `SELECT * FROM books`;
    let books = await db.all(getBooksQuery);
    res.status(200).json({ allBooks: books });
  } catch (e) {
    console.log("/books", e.message);
    res.status(500).send("Internal Server Error");
  }
});

//to get specific book based on book id = id
app.get("/book/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log(bookId);

    let bookQuery = `SELECT * FROM books WHERE id = ${bookId}`;
    const book = await db.get(bookQuery);
    res.status(200).json({ book: book });
  } catch (e) {
    console.log("books", e.message);
    res.status(500).send("Internal Server Error");
  }
});

//add book api
app.post("/add-book", async (req, res) => {
  try {
    const {
      id,
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,
      editionLanguage,
      price,
      onlineStores,
    } = req.body;

    const addBookQuery = `INSERT INTO books(
      id,
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,
      editionLanguage,
      price,
      onlineStores
      )

      VALUES(
       ${id},
      '${title}',
       ${authorId},
      ${rating},
      ${ratingCount},
      ${reviewCount},
      '${description}',
      ${pages},
      ${dateOfPublication},
      '${editionLanguage}',
      ${price},
      '${onlineStores}');`;
    const book = await db.run(addBookQuery);
    res
      .status(201)
      .json({ message: `Book Added succesfully with id of ${book.lastID}` });
  } catch (e) {
    console.log("add-book", e.message);
    res.status(500).send("Internal Server Error");
  }
});

//update a book
app.put("/book/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const { title } = req.body;
  try {
    const updateQuery = `UPDATE books SET title = '${title}' WHERE id = ${bookId}`;
    const book = await db.run(updateQuery);
    res
      .status(200)
      .json({ message: `Book Updated successfully with book id of ${bookId}` });
  } catch (e) {
    console.log("books", e.message);
    res.status(500).send("Internal Server Error");
  }
});

//delete book api
app.delete("/book/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const updateQuery = `DELETE FROM books WHERE id = ${bookId}`;
    const book = await db.run(updateQuery);
    res
      .status(200)
      .json({ message: `Book Deleted successfully with book id of ${bookId}` });
  } catch (e) {
    console.log("books", e.message);
    res.status(500).send("Internal Server Error");
  }
});

//filters api

app.get("/filters",jwtAuth, async (request, response) => {
  const {
    offset = 0,
    limit = 2,
    order = "ASC",
    order_by = "id",
    search_q = "",
  } = request.query;

  const getBooksQuery = `
    SELECT
      *
    FROM
     books
    WHERE
     title LIKE '%${search_q}%'
    ORDER BY ${order_by} ${order}
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)};`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//signup api
app.post("/signup", async (req, res) => {
  const { id, username, gender, email, location, password } = req.body;

  try {
    const isUserExist = await db.get(
      `SELECT * FROM users WHERE email = '${email}'`
    );

    if (isUserExist === undefined) {
      if (password.length >= 8) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const addUserQuery = `INSERT INTO users(id,username, gender, email, location, password)
      VALUES(
        ${id},
        '${username}',
        '${gender}',
        '${email}',
        '${location}',
        '${hashedPassword}'
  
      );`;

        const user = await db.run(addUserQuery);
        return res
          .status(200)
          .json({ message: `User added successfully with ${user.lastID}` });
      }
      return res
        .status(400)
        .json({
          message: "Password length should be greater than or equl to 8",
        });
    } else {
      return res.status(400).json({ message: "Email Already Exists" });
    }
  } catch (e) {
    console.log("/signup", e.message);
    return res.status(500).send("Internal Server Error");
  }
});

//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const isUserExist = await db.get(
      `SELECT * FROM users WHERE email = '${email}'`
    );
    if (isUserExist === undefined) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    // //check password
    const isPasswordMatch = await bcrypt.compare(
      password,
      isUserExist.password
    );
    if (isPasswordMatch) {
      //token generate
      const payload = {
        email: isUserExist.email,
      };

      const token = jwt.sign(payload, "AJAY_SECRET_KEY", { expiresIn: "1hr" });

      return res
        .status(200)
        .json({
          message: `Hi! ${isUserExist.username},Login Successfully!`,
          token: token,
        });
    }
    return res.status(401).json({ message: "Password Not Matched" });
  } catch (e) {
    console.log("/login", e.message);
    res.status(500).send("Internal Server Error");
  }
});

//profile api
app.get("/profile", jwtAuth, async (req, res) => {
  try {
    const user = await db.get(
      `SELECT * FROM users WHERE email = '${req.userEmail}'`
    );
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    return res.status(200).json({ message: "Profile", user: user });
  } catch (e) {
    console.log("/profile", e.message);
    res.status(500).send("Internal Server Error");
  }
});


console.log("hello")
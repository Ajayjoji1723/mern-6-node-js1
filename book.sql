CREATE TABLE BOOKS(
    id INT, 
    title TEXT, 
    authorId INT,
    rating FLOAT,
    ratingCount INT,
    reviewCount INT,
    description TEXT,
    pages INT,
    dateOfPublication DATE,
    editionLanguage TEXT,
    price INT,
    onlineStores TEXT
)


PRAGMA TABLE_INFO(BOOKS)


INSERT INTO BOOKS(
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
) VALUES 
(2, "Titanic", 2, 4.8, 400, 600, "Good Feel Book", 50, "1980-08-10","English", 5758, "Flipkart"),
(3, "Avathar", 2, 3.9, 800, 100, "Sci -Fi", 100, "2011-07-18","English", 789, "Amazon"),
(4, "2012", 3, 3.5, 410, 600, "Action", 50, "1980-08-10","English", 5758, "Flipkart")




SELECT * FROM BOOKS WHERE id = 1;


CREATE TABLE users(id INT, username TEXT, gender TEXT, email TEXT, location TEXT, password TEXT);



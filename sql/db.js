const spicedPg = require("spiced-pg");

let db;

if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg(
        "postgres:pablomartinwaehner:password@localhost:5432/imageboard" //imageboard = name of database
    );
}

exports.getImages = function() {
    const q = "SELECT * FROM images ORDER BY created_at DESC LIMIT 3;"; //to put the images according to the date
    return db.query(q).then(results => {
        // console.log(results.rows);
        return results.rows;
    });
};

exports.getImagesId = function(id) {
    const params = [id];
    const q = `
        SELECT * FROM images WHERE id = $1
        ;
        `;
    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

exports.addImage = function(url, username, title, description) {
    const q = `INSERT INTO images (url, username, title, description)
    VALUES($1, $2, $3, $4)
    RETURNING *`;
    const params = [url, username, title, description];
    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

exports.addComment = function(image_id, username, comment) {
    const q = `INSERT INTO comments (image_id, username, comment)
        VALUES ($1, $2, $3)
        RETURNING *;`;

    const params = [image_id, username, comment];
    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

exports.deleteImage = function(id) {
    const q = `DELETE FROM images WHERE id = $1;
               `;
    const params = [id];
    return db.query(q, params).then(deletedImage => {
        return deletedImage;
    });
};

exports.getComments = function(image_id) {
    const q = `
        SELECT * FROM comments
        WHERE image_id = $1
        ORDER BY created_at DESC LIMIT 3;
    `;
    const params = [image_id];
    return db.query(q, params).then(results => {
        return results.rows;
    });
};

module.exports.getMoreImages = function(lastImage) {
    const q = `
        SELECT *, (
            SELECT id FROM images ORDER BY id ASC LIMIT 1
        ) as id_first_image FROM images WHERE id < $1 ORDER BY id DESC LIMIT 3
    `;
    const params = [lastImage];
    return db
        .query(q, params)
        .then(results => {
            // console.log(results.rows);
            return results.rows;
        })
        .catch(err => {
            console.log(err);
        });
};

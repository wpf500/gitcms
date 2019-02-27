CREATE TABLE repositories (
    id CHAR(100) PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    liveUrl VARCHAR(255) NOT NULL,
    users TEXT NOT NULL,
    publicKey TEXT NOT NULL,
    privateKey TEXT NOT NULL
);

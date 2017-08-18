CREATE TABLE repositories (
    id CHAR(100) PRIMARY KEY NOT NULL,
    url VARCHAR(255) NOT NULL,
    publicKey TEXT NOT NULL,
    privateKey TEXT NOT NULL
);

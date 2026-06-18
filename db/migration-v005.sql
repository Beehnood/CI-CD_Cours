USE ynov_ci;

ALTER TABLE utilisateur
    ADD COLUMN telephone VARCHAR(20) NULL AFTER code_postal;

UPDATE utilisateur
SET telephone = '0612345678'
WHERE id = 1 AND telephone IS NULL;

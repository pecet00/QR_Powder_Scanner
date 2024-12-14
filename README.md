
Node lib:
npm install express body-parser mysql2 dotenv


CREATE DATABASE IF NOT EXISTS QRMachinePowder;
USE QRMachinePowder;

CREATE TABLE IF NOT EXISTS qr_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique identifier for each entry
    printer_code VARCHAR(255) NOT NULL,    -- QR1 value (Printer code)
    powder_code VARCHAR(255) NOT NULL,     -- Scanned powder code
    scan_time DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp for when the code was scanned
);

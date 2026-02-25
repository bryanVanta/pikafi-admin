-- Database Schema for VantaTech Admin

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_type VARCHAR(100),
    id_number VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(100),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gradings Table
CREATE TABLE IF NOT EXISTS gradings (
    id SERIAL PRIMARY KEY,
    uid INTEGER,
    blockchain_uid INTEGER,
    card_name VARCHAR(255) NOT NULL,
    card_set VARCHAR(255),
    card_year VARCHAR(50),
    condition VARCHAR(100),
    image_url TEXT,
    status VARCHAR(100) DEFAULT 'Submitted',
    customer_id INTEGER REFERENCES customers(id),
    grade VARCHAR(50),
    grade_corners VARCHAR(50),
    grade_edges VARCHAR(50),
    grade_surface VARCHAR(50),
    grade_centering VARCHAR(50),
    authentication_result VARCHAR(100),
    inspection_metadata JSONB,
    slabbing_proof_image TEXT,
    return_method VARCHAR(20),
    tracking_provider VARCHAR(100),
    tracking_number VARCHAR(100),
    tx_hash VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grading Status History Table
CREATE TABLE IF NOT EXISTS grading_status_history (
    id SERIAL PRIMARY KEY,
    grading_id INTEGER REFERENCES gradings(id),
    status VARCHAR(100) NOT NULL,
    tx_hash VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Legacy/Compatibility Tables
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    amount VARCHAR(255) NOT NULL,
    data TEXT,
    timestamp BIGINT NOT NULL,
    status INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    seller VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    grade VARCHAR(50),
    tx_hash VARCHAR(255),
    ipfs_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

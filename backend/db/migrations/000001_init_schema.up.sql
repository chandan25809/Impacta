-- Create Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- E.g., 'campaign_creator', 'donor', 'admin'
    status VARCHAR(50) DEFAULT 'active', -- E.g., 'active', 'inactive', 'banned'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Campaigns Table
CREATE TABLE Campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES Users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0,
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- E.g., 'pending', 'active', 'closed'
    currency VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES Users(id),
    approved_at TIMESTAMP
);

-- Create Donations Table
CREATE TABLE Donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES Campaigns(id),
    donor_id UUID REFERENCES Users(id),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'completed', -- E.g., 'completed', 'failed', 'pending'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create PaymentTransactions Table
CREATE TABLE PaymentTransactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES Donations(id),
    gateway VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- E.g., 'completed', 'failed', 'pending'
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Comments Table
CREATE TABLE Comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES Campaigns(id),
    user_id UUID REFERENCES Users(id),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- E.g., 'active', 'deleted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MediaFiles Table
CREATE TABLE MediaFiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES Campaigns(id),
    file_type VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- E.g., 'active', 'deleted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CampaignAnalytics Table
CREATE TABLE CampaignAnalytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES Campaigns(id),
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    conversion_rate NUMERIC(5, 2),
    avg_donation NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'active', -- E.g., 'active', 'archived'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications Table
CREATE TABLE Notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id),
    type VARCHAR(50) NOT NULL, -- E.g., 'campaign_update', 'new_donation'
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'unread', -- E.g., 'unread', 'read', 'deleted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SupportTickets Table
CREATE TABLE SupportTickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id),
    campaign_id UUID REFERENCES Campaigns(id),
    type VARCHAR(50) NOT NULL, -- E.g., 'dispute', 'general_query'
    status VARCHAR(50) DEFAULT 'open', -- E.g., 'open', 'resolved', 'closed'
    priority VARCHAR(50) NOT NULL, -- E.g., 'low', 'medium', 'high'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create PaymentMethods Table
CREATE TABLE PaymentMethods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id),
    type VARCHAR(50) NOT NULL, -- E.g., 'credit_card', 'paypal'
    provider VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active', -- E.g., 'active', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Withdrawals Table
CREATE TABLE Withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES Campaigns(id),
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- E.g., 'pending', 'processed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

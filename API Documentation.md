# Impacta API Documentation

This document provides an overview of the available endpoints for the Impacta project along with sample cURL commands and expected responses.

---

## USERS

### Register User
**Endpoint:** `POST /register`  
**Description:** Registers a new user.  
**Sample Request:**

```bash
curl --location 'http://localhost:8080/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test10@example.com",
    "password": "password",
    "full_name": "Test User",
    "role": "campaign_creator"
}'
```


**Sample Response:**

```bash
{
    "message": "User registered successfully",
    "user": {
        "created_at": "2025-03-03T23:51:01.124141Z",
        "email": "test10@example.com",
        "full_name": "Test User",
        "id": "a56c2b58-b679-4399-a46d-a3e5f7fc5132",
        "role": "campaign_creator",
        "status": "active",
        "updated_at": "2025-03-03T23:51:01.124141Z"
    }
}
```


### Login User
**Endpoint:** `POST /login`
**Description:** Logs in an existing user and returns a JWT token.
**Sample Request:**

```bash
curl --location 'http://localhost:8080/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test1@example.com",
    "password": "password"
}'
```


Sample Response:

```bash
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmFmNjA3NDItZjE2Yy00NmZmLTk3OGQtMGM3NDFiMmQwZmQ0IiwiZW1haWwiOiJ0ZXN0MUBleGFtcGxlLmNvbSIsInJvbGUiOiJjYW1wYWlnbl9jcmVhdG9yIiwiZXhwIjoxNzQxMTEyNTExLCJpYXQiOjE3NDEwMjYxMTF9.0h-czjrtmRIndZSSkIVD8FS7SVYUooLnHrWtqSp1o7Y"
}

```
### Get User Details
**Endpoint:** GET /user
**Description:** Retrieves details of the logged-in user (protected route).

**Sample Request:**

```bash
curl --location 'http://localhost:8080/user' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--header 'Content-Type: application/json'
```

**Sample Response:**
```bash
{
    "message": "User registered successfully",
    "user": {
        "created_at": "2025-03-02T08:14:46.470164Z",
        "email": "test1@example.com",
        "full_name": "Test User",
        "id": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
        "role": "campaign_creator",
        "status": "active",
        "updated_at": "2025-03-02T08:14:46.470164Z"
    }
}
```

### Update User
**Endpoint:** PUT /user
**Description:** Updates the details of the logged-in user (protected route).

**Sample Request:**

```bash
curl -X PUT http://localhost:8080/user \
-H "Authorization: Bearer <YOUR_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "full_name": "Updated Name",
  "role": "admin"
}'
```

**Sample Response:**

```bash
{
  "message": "User updated successfully",
  "user": {
    "id": "4b160163-d745-4cad-8d5f-9206e56bf4c4",
    "email": "test@example.com",
    "full_name": "Updated Name",
    "role": "admin",
    "status": "active",
    "created_at": "2025-01-26T22:47:41.395914Z",
    "updated_at": "2025-01-26T22:50:00.123456Z"
  }
}
```

### Delete User (Admin Only)
**Endpoint:** DELETE /user
**Description:** Deletes the currently logged-in user (admin privileges required).

**Sample Request:**

```bash
curl -X DELETE http://localhost:8080/user \
-H "Authorization: Bearer <YOUR_TOKEN>" \
-H "Content-Type: application/json"
```

**Sample Response:**

```bash
{
  "message": "User deleted successfully"
}
```

### Get All Users (Admin Only)
**Endpoint:** GET /users
**Description:** Retrieves a list of all users (admin privileges required).

**Sample Request:**

```bash
curl -X GET http://localhost:8080/users \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json"
```

**Sample Response:**

```bash
{
  "users": [
    {
      "id": "984021e5-c8ac-4c04-b5ad-dfbcf35850ee",
      "email": "test@example.com",
      "full_name": "Updated Name",
      "role": "campaign_creator",
      "status": "active",
      "created_at": "2025-01-26T23:03:21.393727Z",
      "updated_at": "2025-01-26T12:36:19.784585Z"
    }
  ]
}
```

## CAMPAIGNS

### Create Campaign

**Endpoint:** POST /campaigns
**Description:** Creates a new campaign (protected route).

**Sample Request:**

```bash
curl -X POST http://localhost:8080/campaigns \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d '{
    "title": "Test Campaign",
    "description": "A test campaign",
    "target_amount": 1000,
    "deadline": "2025-12-31T00:00:00Z",
    "currency": "USD",
    "category": "education"
}'
```

**Sample Response:**

```bash
{
    "message": "Campaign created successfully",
    "campaign": {
        "ID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
        "CreatorID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
        "Title": "Test Campaign",
        "Description": "This is a test campaign",
        "TargetAmount": 5000,
        "CurrentAmount": 0,
        "Deadline": "2025-12-31T23:59:59Z",
        "Status": "pending",
        "Currency": "USD",
        "Category": "education",
        "CreatedAt": "2025-03-04T00:01:52.699045Z",
        "UpdatedAt": "2025-03-04T00:01:52.699045Z"
    }
}
```


### Get All Campaigns (Public)
**Endpoint:** GET /campaigns
**Description:** Retrieves a list of campaigns with optional filters and sorting.

**Sample Request:**

```bash
curl --location 'http://localhost:8080/campaigns?category=education&sort_by=created_at&order=desc'
```

**Sample Response:**

```bash
{
    "campaigns": [
        {
            "ID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
            "CreatorID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
            "Title": "Test Campaign",
            "Description": "This is a test campaign",
            "TargetAmount": 5000,
            "CurrentAmount": 0,
            "Deadline": "2025-12-31T23:59:59Z",
            "Status": "pending",
            "Currency": "USD",
            "Category": "education",
            "CreatedAt": "2025-03-04T00:01:52.699045Z",
            "UpdatedAt": "2025-03-04T00:01:52.699045Z"
        },
        {
            "ID": "8eb572aa-9b9a-40d1-b4f0-d8d0260e9724",
            "CreatorID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
            "Title": "Test Campaign",
            "Description": "This is a test campaign",
            "TargetAmount": 5000,
            "CurrentAmount": 0,
            "Deadline": "2025-12-31T23:59:59Z",
            "Status": "pending",
            "Currency": "USD",
            "Category": "education",
            "CreatedAt": "2025-03-02T08:25:48.247274Z",
            "UpdatedAt": "2025-03-02T08:25:48.247274Z"
        }
    ]
}
```

### Get Single Campaign

**Endpoint:** GET /campaigns/detail/:id
**Description:** Retrieves the details of a single campaign by its ID.

**Sample Request:**

```bash
curl --location 'http://localhost:8080/campaigns/detail/8eb572aa-9b9a-40d1-b4f0-d8d0260e9724'
```

**Sample Response:**

```bash
{
    "campaign": {
        "ID": "8eb572aa-9b9a-40d1-b4f0-d8d0260e9724",
        "CreatorID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
        "Title": "Test Campaign",
        "Description": "This is a test campaign",
        "TargetAmount": 5000,
        "CurrentAmount": 0,
        "Deadline": "2025-12-31T23:59:59Z",
        "Status": "pending",
        "Currency": "USD",
        "Category": "education",
        "CreatedAt": "2025-03-02T08:25:48.247274Z",
        "UpdatedAt": "2025-03-02T08:25:48.247274Z"
    }
}
```

### Update Campaign

**Endpoint:** PUT /campaigns/:id
**Description:** Updates an existing campaign (protected route).

**Sample Request:**

```bash
curl -X PUT http://localhost:8080/campaigns/<CAMPAIGN_ID> \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d '{"title": "Updated Campaign Title"}'
```

**Sample Response:**

```bash
{
  "message": "Campaign updated successfully",
  "campaign": {
    "id": "b123e456-78cd-90ab-12de-34fgh567ijkl",
    "creator_id": "a789b012-34cd-56ef-78gh-90ijklmnopqr",
    "title": "Updated Campaign Title",
    "description": "Updated campaign description with new details.",
    "target_amount": 10000.00,
    "current_amount": 2500.00,
    "deadline": "2025-06-30T23:59:59Z",
    "currency": "USD",
    "category": "Education",
    "status": "approved",
    "created_at": "2025-02-01T12:00:00Z",
    "updated_at": "2025-03-02T15:30:00Z"
  }
}
```

### Delete Campaign

**Endpoint:** DELETE /campaigns/:id
**Description:** Deletes a campaign (protected route).

**Sample Request:**

```bash
curl -X DELETE http://localhost:8080/campaigns/<CAMPAIGN_ID> \
-H "Authorization: Bearer <TOKEN>"
```

**Sample Response:**

```bash
{
  "message": "Campaign deleted successfully"
}
```

## DONATIONS

### Make Donation

**Endpoint:** POST /donations
**Description:** Creates a donation for a campaign. If the donor does not exist, a new donor record is created.

**Sample Request:**

```bash
curl -X POST http://localhost:8080/donations \
-H "Authorization: Bearer <YOUR_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
    "campaign_id": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 50.00,
    "currency": "USD",
    "message": "Keep up the great work!",
    "is_anonymous": false,
    "donor_name": "John Doe",
    "email": "john.doe@example.com"
}'
```

**Sample Response:**

```bash
{
    "donation": {
        "ID": "4c21c657-566f-43fe-ab8a-2b9b33edf080",
        "CampaignID": "8eb572aa-9b9a-40d1-b4f0-d8d0260e9724",
        "DonorID": "f93b1069-f067-4fa6-8f81-4b1e5e1a8979",
        "Amount": 50,
        "Currency": "USD",
        "Message": "Supporting the cause!",
        "IsAnonymous": false,
        "Status": "completed",
        "CreatedAt": "2025-03-04T00:09:11.696908Z",
        "UpdatedAt": "2025-03-04T00:09:11.696908Z"
    },
    "donor": {
        "email": "john.doe@example.com",
        "full_name": "John Doe",
        "id": "f93b1069-f067-4fa6-8f81-4b1e5e1a8979"
    },
    "message": "Donation successful"
}
```

### List Campaign Donations

**Endpoint:** GET /campaigns/:id/donations
**Description:** Retrieves all donations for a given campaign along with donor information.

**Sample Request:**

```bash
curl --location 'http://localhost:8080/campaigns/<CAMPAIGN_UUID>/donations' \
--header 'Content-Type: application/json'
```

**Sample Response:**

```bash
{
  "donations": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "campaign_id": "987e6543-a123-4bcd-9abc-123def456789",
      "donor_id": "456e7890-f123-4abc-a456-789123456abc",
      "amount": 50.00,
      "currency": "USD",
      "message": "Supporting a great cause!",
      "is_anonymous": false,
      "status": "completed",
      "created_at": "2025-02-09T15:00:00Z",
      "updated_at": "2025-02-09T15:00:00Z"
    }
  ]
}
```

### List User Donations (Admin Only)

**Endpoint:** GET /user/donations
**Description:** Retrieves a list of donations (with optional filtering) for an admin user.

**Sample Request:**

```bash
curl -X GET http://localhost:8080/user/donations \
-H "Authorization: Bearer <YOUR_TOKEN>" \
-H "Content-Type: application/json"
```

**Sample Response:**

```bash
{
  "donations": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "campaign_id": "987e6543-a123-4bcd-9abc-123def456789",
      "donor_id": "456e7890-f123-4abc-a456-789123456abc",
      "amount": 50.00,
      "currency": "USD",
      "message": "Supporting a great cause!",
      "is_anonymous": false,
      "status": "completed",
      "created_at": "2025-02-09T15:00:00Z",
      "updated_at": "2025-02-09T15:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "campaign_id": "654e3210-b456-7def-890a-bcde789f0123",
      "donor_id": "456e7890-f123-4abc-a456-789123456abc",
      "amount": 100.00,
      "currency": "EUR",
      "message": "Happy to contribute!",
      "is_anonymous": true,
      "status": "completed",
      "created_at": "2025-02-10T10:30:00Z",
      "updated_at": "2025-02-10T10:30:00Z"
    }
  ]
}
```

### Update Donation (Admin Only)

**Endpoint:** PUT /donations/:id
**Description:** Updates a donation. This endpoint is protected (admin only).

**Sample Request:**

```bash
curl -X PUT http://localhost:8080/donations/<DONATION_ID> \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
    "amount": 200.00,
    "currency": "USD",
    "message": "Updated donation message",
    "is_anonymous": true,
    "status": "completed"
}'
```

**Sample Response:**

```bash
{
  "message": "Donation updated successfully",
  "donation": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "campaign_id": "123e4567-e89b-12d3-a456-426614174111",
    "donor_id": "123e4567-e89b-12d3-a456-426614174222",
    "amount": 200.00,
    "currency": "USD",
    "message": "Updated donation message",
    "is_anonymous": true,
    "status": "completed",
    "created_at": "2025-01-26T23:35:12.979173Z",
    "updated_at": "2025-01-27T00:00:00.000000Z"
  }
}
```


## MEDIA FILES

### Create Media File

**Endpoint:** POST /mediafiles
**Description:** Creates a new media file record (protected; only admin or campaign_creator roles).

**Sample Request:**

```bash
curl --location 'http://localhost:8080/mediafiles' \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data '{
    "campaign_id": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
    "file_type": "image",
    "url": "http://example.com/path/to/image.png"
}'
```

**Sample Response:**

```bash
{
    "message": "Media file created successfully",
    "media_file": {
        "ID": "d37d501c-d2e8-49ec-a694-7cd41360e13e",
        "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
        "FileType": "image",
        "URL": "http://example.com/path/to/image.png",
        "Status": "active",
        "CreatedAt": "2025-03-03T13:42:30.398847Z",
        "UpdatedAt": "2025-03-03T13:42:30.398847Z"
    }
}
```

### Get Media File by ID

**Endpoint:** GET /mediafiles/:id
**Description:** Retrieves a media file by its unique ID.

**Sample Request:**

```bash
curl --location 'http://localhost:8080/mediafiles/MEDIAFILE_UUID' \
--header 'Content-Type: application/json'
```

**Sample Response:**

```bash
{
    "ID": "d37d501c-d2e8-49ec-a694-7cd41360e13e",
    "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
    "FileType": "image",
    "URL": "http://example.com/path/to/image.png",
    "Status": "active",
    "CreatedAt": "2025-03-03T13:42:30.398847Z",
    "UpdatedAt": "2025-03-03T13:42:30.398847Z"
}
```

### List Media Files by Campaign ID

**Endpoint:** GET /campaigns/:campaign_id/mediafiles
**Description:** Retrieves a list of media files associated with a specific campaign.

**Sample Request:**

```bash
curl -X GET http://localhost:8080/campaigns/CAMPAIGN_UUID/mediafiles \
  -H "Content-Type: application/json"
```

**Sample Response:**

```bash
[
    {
        "ID": "d37d501c-d2e8-49ec-a694-7cd41360e13e",
        "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
        "FileType": "image",
        "URL": "http://example.com/path/to/image.png",
        "Status": "active",
        "CreatedAt": "2025-03-03T13:42:30.398847Z",
        "UpdatedAt": "2025-03-03T13:42:30.398847Z"
    }
]
```

### List Media Files by User ID

**Endpoint:** GET /users/:user_id/mediafiles
**Description:** Retrieves media files for campaigns where the specified user is the creator.

**Sample Request:**

```bash
curl -X GET http://localhost:8080/users/USER_UUID/mediafiles \
  -H "Content-Type: application/json"
```

**Sample Response:**

```bash
[
    {
        "ID": "7f10bd6d-5ccb-4bee-afbf-50102b29e1ff",
        "CampaignID": "8eb572aa-9b9a-40d1-b4f0-d8d0260e9724",
        "FileType": "banner",
        "URL": "https://images.gofundme.com/FRTOEsRb4VcJ5RDwaspV9bOGPMc=/720x405/https://d2g8igdw686xgo.cloudfront.net/74883377_1692651226905050_r.jpeg",
        "Status": "active",
        "CreatedAt": "2025-03-01T22:00:47.942133Z",
        "UpdatedAt": "2025-03-01T22:00:47.942133Z"
    },
    {
        "ID": "d37d501c-d2e8-49ec-a694-7cd41360e13e",
        "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
        "FileType": "image",
        "URL": "http://example.com/path/to/image.png",
        "Status": "active",
        "CreatedAt": "2025-03-03T13:42:30.398847Z",
        "UpdatedAt": "2025-03-03T13:42:30.398847Z"
    }
]
```

### Bulk Delete Media Files

**Endpoint:** DELETE /mediafiles/bulk
**Description:** Deletes multiple media files specified by their IDs. (Protected; only allowed for admins or campaign owners.)

**Sample Request:**

```bash
curl -X DELETE http://localhost:8080/mediafiles/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "ids": [
          "MEDIAFILE_UUID_1",
          "MEDIAFILE_UUID_2"
        ]
      }'
```

**Sample Response:**

```bash
{
  "message": "Media files deleted successfully"
}
```


## COMMENTS

### Create Comment

**Endpoint:** POST /comments
**Description:** Creates a new comment on a campaign (protected route; user ID is derived from the JWT).

**Sample Request:**

```bash
curl --location 'http://localhost:8080/comments' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
        "campaign_id": "CAMPAIGN_UUID",
        "content": "This is a test comment."
      }'
```

**Sample Response:**

```bash
{
    "comment": {
        "ID": "a5f03c29-fd44-40e9-b56a-5e2a38c17ea7",
        "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
        "UserID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
        "Content": "This is a test comment.",
        "Status": "active",
        "CreatedAt": "2025-03-03T13:48:10.781068Z",
        "UpdatedAt": "2025-03-03T13:48:10.781068Z"
    },
    "message": "Comment created successfully"
}
```

### Get Comment by ID

**Endpoint:** GET /comments/:id
**Description:** Retrieves a single comment by its ID.

**Sample Request:**

```bash
curl --location 'http://localhost:8080/comments/a5f03c29-fd44-40e9-b56a-5e2a38c17ea7' \
--header 'Content-Type: application/json'
```

**Sample Response:**

```bash
{
    "ID": "a5f03c29-fd44-40e9-b56a-5e2a38c17ea7",
    "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
    "UserID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
    "Content": "This is a test comment.",
    "Status": "active",
    "CreatedAt": "2025-03-03T13:48:10.781068Z",
    "UpdatedAt": "2025-03-03T13:48:10.781068Z"
}
```

### List Comments by Campaign ID

**Endpoint:** GET /campaigns/:campaign_id/comments
**Description:** Retrieves all comments for a given campaign.

**Sample Request:**

```bash
curl --location 'http://localhost:8080/campaigns/CAMPAIGN_UUID/comments' \
--header 'Content-Type: application/json'
```

**Sample Response:**

```bash
[
    {
        "ID": "a5f03c29-fd44-40e9-b56a-5e2a38c17ea7",
        "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
        "UserID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
        "Content": "This is a test comment.",
        "Status": "active",
        "CreatedAt": "2025-03-03T13:48:10.781068Z",
        "UpdatedAt": "2025-03-03T13:48:10.781068Z"
    }
]
```

### List Comments by User ID

**Endpoint:** GET /users/:user_id/comments
**Description:** Retrieves all comments made by a specific user.

**Sample Request:**

```bash
curl --location 'http://localhost:8080/users/baf60742-f16c-46ff-978d-0c741b2d0fd4/comments' \
--header 'Content-Type: application/json'
```

**Sample Response:**

```bash
[
    {
        "ID": "a5f03c29-fd44-40e9-b56a-5e2a38c17ea7",
        "CampaignID": "5c5c529b-6fa8-4260-919b-1c82d65c88a9",
        "UserID": "baf60742-f16c-46ff-978d-0c741b2d0fd4",
        "Content": "This is a test comment.",
        "Status": "active",
        "CreatedAt": "2025-03-03T13:48:10.781068Z",
        "UpdatedAt": "2025-03-03T13:48:10.781068Z"
    }
]
```

### Delete Comment

**Endpoint:** DELETE /comments/:id
**Description:** Deletes a comment (protected route; only the comment owner or an admin can delete).

**Sample Request:**

```bash
curl --location --request DELETE 'http://localhost:8080/comments/COMMENT_UUID' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--header 'Content-Type: application/json'
```

**Sample Response:**

```bash
{
  "message": "Comment deleted successfully"
}
```


## NOTIFICATIONS

### Create Notification  
**Endpoint:** `POST /notifications` (Protected)  
**Description:** Creates a new notification for the authenticated user.  
**Sample Request:**
```bash
curl --location 'http://localhost:8080/notifications' \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "type": "new_donation",
  "content": "You have received a new donation!"
}'
```
**Sample Response:**
```json
{
  "message": "Notification created successfully",
  "notification": {
    "ID": "<NOTIF_ID>",
    "UserID": "<USER_UUID>",
    "Type": "new_donation",
    "Content": "You have received a new donation!",
    "IsRead": false,
    "Status": "unread",
    "CreatedAt": "2025-03-04T00:10:00Z",
    "UpdatedAt": "2025-03-04T00:10:00Z"
  }
}
```

### Get Notification by ID  
**Endpoint:** `GET /notifications/:id` (Protected)  
**Description:** Retrieves a notification by its unique ID.  
**Sample Request:**
```bash
curl --location 'http://localhost:8080/notifications/<NOTIF_ID>' \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json'
```
**Sample Response:**
```json
{
  "notification": {
    "ID": "<NOTIF_ID>",
    "UserID": "<USER_UUID>",
    "Type": "new_donation",
    "Content": "You have received a new donation!",
    "IsRead": false,
    "Status": "unread",
    "CreatedAt": "2025-03-04T00:10:00Z",
    "UpdatedAt": "2025-03-04T00:10:00Z"
  }
}
```

### List Notifications by User  
**Endpoint:** `GET /notifications?user_id=<USER_UUID>` (Protected)  
**Description:** Retrieves all notifications for the specified user.  
**Sample Request:**
```bash
curl --location 'http://localhost:8080/notifications?user_id=<USER_UUID>' \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json'
```
**Sample Response:**
```json
{
  "notifications": [
    {
      "ID": "<NOTIF_ID>",
      "UserID": "<USER_UUID>",
      "Type": "new_donation",
      "Content": "You have received a new donation!",
      "IsRead": false,
      "Status": "unread",
      "CreatedAt": "2025-03-04T00:10:00Z",
      "UpdatedAt": "2025-03-04T00:10:00Z"
    }
  ]
}
```

### Update Notification by ID  
**Endpoint:** `PUT /notifications/:id` (Protected)  
**Description:** Updates an existing notification.  
**Sample Request:**
```bash
curl -X PUT http://localhost:8080/notifications/<NOTIF_ID> \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "type": "campaign_update",
  "content": "Your campaign has received an update.",
  "is_read": true,
  "status": "read"
}'
```
**Sample Response:**
```json
{
  "message": "Notification updated successfully",
  "notification": {
    "ID": "<NOTIF_ID>",
    "UserID": "<USER_UUID>",
    "Type": "campaign_update",
    "Content": "Your campaign has received an update.",
    "IsRead": true,
    "Status": "read",
    "CreatedAt": "2025-03-04T00:10:00Z",
    "UpdatedAt": "2025-03-04T00:20:00Z"
  }
}
```

### Bulk Delete Notifications  
**Endpoint:** `DELETE /notifications/bulk` (Protected)  
**Description:** Deletes multiple notifications by their IDs.  
**Sample Request:**
```bash
curl -X DELETE http://localhost:8080/notifications/bulk \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "ids": ["<NOTIF_ID_1>", "<NOTIF_ID_2>"]
}'
```
**Sample Response:**
```json
{
  "message": "Notifications deleted successfully"
}
```




## SUPPORT TICKETS

### Create Support Ticket  
**Endpoint:** `POST /support-tickets` (Protected)  
**Description:** Creates a new support ticket for the authenticated user.  
**Sample Request:**
```bash
curl -X POST http://localhost:8080/support-tickets \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "campaign_id": "<CAMPAIGN_ID>",
  "type": "dispute",
  "priority": "high",
  "query": "I have an issue with my campaign payment.",
  "answer": ""
}'
```
**Sample Response:**
```json
{
  "message": "Support ticket created successfully",
  "ticket": {
    "ID": "<TICKET_ID>",
    "UserID": "<USER_UUID>",
    "CampaignID": "<CAMPAIGN_ID>",
    "Type": "dispute",
    "Priority": "high",
    "Status": "open",
    "Query": "I have an issue with my campaign payment.",
    "Answer": "",
    "CreatedAt": "2025-03-04T00:30:00Z",
    "UpdatedAt": "2025-03-04T00:30:00Z"
  }
}
```

### Get Support Ticket by ID  
**Endpoint:** `GET /support-tickets/:id` (Protected)  
**Description:** Retrieves a specific support ticket by its ID.  
**Sample Request:**
```bash
curl -X GET http://localhost:8080/support-tickets/<TICKET_ID> \
--header 'Authorization: Bearer <YOUR_TOKEN>'
```
**Sample Response:**
```json
{
  "ticket": {
    "ID": "<TICKET_ID>",
    "UserID": "<USER_UUID>",
    "CampaignID": "<CAMPAIGN_ID>",
    "Type": "dispute",
    "Priority": "high",
    "Status": "open",
    "Query": "I have an issue with my campaign payment.",
    "Answer": "",
    "CreatedAt": "2025-03-04T00:30:00Z",
    "UpdatedAt": "2025-03-04T00:30:00Z"
  }
}
```

### List Support Tickets  
**Endpoint:** `GET /support-tickets?user_id=<USER_UUID>` (Protected)  
**Description:** Lists all support tickets for a given user.  
**Sample Request:**
```bash
curl -X GET "http://localhost:8080/support-tickets?user_id=<USER_UUID>" \
--header 'Authorization: Bearer <YOUR_TOKEN>'
```
**Sample Response:**
```json
{
  "tickets": [
    {
      "ID": "<TICKET_ID>",
      "UserID": "<USER_UUID>",
      "CampaignID": "<CAMPAIGN_ID>",
      "Type": "dispute",
      "Priority": "high",
      "Status": "open",
      "Query": "I have an issue with my campaign payment.",
      "Answer": "",
      "CreatedAt": "2025-03-04T00:30:00Z",
      "UpdatedAt": "2025-03-04T00:30:00Z"
    }
  ]
}
```

### Update Support Ticket by ID  
**Endpoint:** `PUT /support-tickets/:id` (Protected)  
**Description:** Updates an existing support ticket.  
**Sample Request:**
```bash
curl -X PUT http://localhost:8080/support-tickets/<TICKET_ID> \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "type": "general_query",
  "priority": "medium",
  "status": "resolved",
  "query": "Updated query details.",
  "answer": "Your issue has been resolved."
}'
```
**Sample Response:**
```json
{
  "message": "Support ticket updated successfully",
  "ticket": {
    "ID": "<TICKET_ID>",
    "UserID": "<USER_UUID>",
    "CampaignID": "<CAMPAIGN_ID>",
    "Type": "general_query",
    "Priority": "medium",
    "Status": "resolved",
    "Query": "Updated query details.",
    "Answer": "Your issue has been resolved.",
    "CreatedAt": "2025-03-04T00:30:00Z",
    "UpdatedAt": "2025-03-04T00:45:00Z"
  }
}
```

### Bulk Delete Support Tickets  
**Endpoint:** `DELETE /support-tickets/bulk` (Protected)  
**Description:** Deletes multiple support tickets based on their IDs.  
**Sample Request:**
```bash
curl -X DELETE http://localhost:8080/support-tickets/bulk \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "ids": ["<TICKET_ID_1>", "<TICKET_ID_2>"]
}'
```
**Sample Response:**
```json
{
  "message": "Support tickets deleted successfully"
}
```



## PAYMENT TRANSACTIONS

### Create Payment Transaction  
**Endpoint:** `POST /paymenttransactions` (Protected)  
**Description:** Creates a new payment transaction record (typically triggered during donation processing).  
**Sample Request:**
```bash
curl -X POST http://localhost:8080/paymenttransactions \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "donation_id": "123e4567-e89b-12d3-a456-426614174000",
  "gateway": "Stripe",
  "status": "completed",
  "amount": 100.50,
  "currency": "USD",
  "gateway_transaction_id": "ch_1GqIC8ABC1234XYZ"
}'
```
**Sample Response:**
```json
{
  "payment_transaction": {
    "ID": "<PT_ID>",
    "DonationID": "123e4567-e89b-12d3-a456-426614174000",
    "Gateway": "Stripe",
    "Status": "completed",
    "Amount": 100.50,
    "Currency": "USD",
    "GatewayTransactionID": "ch_1GqIC8ABC1234XYZ",
    "CreatedAt": "2025-03-04T00:55:00Z",
    "UpdatedAt": "2025-03-04T00:55:00Z"
  }
}
```

### Get Payment Transaction by ID  
**Endpoint:** `GET /paymenttransactions/:id` (Protected)  
**Description:** Retrieves a payment transaction by its ID.  
**Sample Request:**
```bash
curl -X GET http://localhost:8080/paymenttransactions/<PT_ID> \
--header 'Authorization: Bearer <YOUR_TOKEN>'
```
**Sample Response:**
```json
{
  "payment_transaction": {
    "ID": "<PT_ID>",
    "DonationID": "123e4567-e89b-12d3-a456-426614174000",
    "Gateway": "Stripe",
    "Status": "completed",
    "Amount": 100.50,
    "Currency": "USD",
    "GatewayTransactionID": "ch_1GqIC8ABC1234XYZ",
    "CreatedAt": "2025-03-04T00:55:00Z",
    "UpdatedAt": "2025-03-04T00:55:00Z"
  }
}
```

### List Payment Transactions  
**Endpoint:** `GET /paymenttransactions?donation_id=<DONATION_ID>` (Protected)  
**Description:** Lists payment transactions, optionally filtered by donation_id.  
**Sample Request:**
```bash
curl -X GET "http://localhost:8080/paymenttransactions?donation_id=123e4567-e89b-12d3-a456-426614174000" \
--header 'Authorization: Bearer <YOUR_TOKEN>'
```
**Sample Response:**
```json
{
  "payment_transactions": [
    {
      "ID": "<PT_ID>",
      "DonationID": "123e4567-e89b-12d3-a456-426614174000",
      "Gateway": "Stripe",
      "Status": "completed",
      "Amount": 100.50,
      "Currency": "USD",
      "GatewayTransactionID": "ch_1GqIC8ABC1234XYZ",
      "CreatedAt": "2025-03-04T00:55:00Z",
      "UpdatedAt": "2025-03-04T00:55:00Z"
    }
  ]
}
```

### Update Payment Transaction  
**Endpoint:** `PUT /paymenttransactions/:id` (Protected, Admin Only)  
**Description:** Updates a payment transaction. Only admins can update these records.  
**Sample Request:**
```bash
curl -X PUT http://localhost:8080/paymenttransactions/<PT_ID> \
--header 'Authorization: Bearer <ADMIN_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "gateway": "PayPal",
  "status": "completed",
  "amount": 120.00,
  "currency": "USD",
  "gateway_transaction_id": "PAYID-LXYZ1234ABC"
}'
```
**Sample Response:**
```json
{
  "message": "Payment transaction updated successfully",
  "payment_transaction": {
    "ID": "<PT_ID>",
    "DonationID": "123e4567-e89b-12d3-a456-426614174000",
    "Gateway": "PayPal",
    "Status": "completed",
    "Amount": 120.00,
    "Currency": "USD",
    "GatewayTransactionID": "PAYID-LXYZ1234ABC",
    "CreatedAt": "2025-03-04T00:55:00Z",
    "UpdatedAt": "2025-03-04T01:10:00Z"
  }
}
```

### Bulk Delete Payment Transactions  
**Endpoint:** `DELETE /paymenttransactions/bulk` (Protected, Admin Only)  
**Description:** Deletes multiple payment transactions by their IDs.  
**Sample Request:**
```bash
curl -X DELETE http://localhost:8080/paymenttransactions/bulk \
--header 'Authorization: Bearer <ADMIN_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "ids": ["<PT_ID_1>", "<PT_ID_2>"]
}'
```
**Sample Response:**
```json
{
  "message": "Payment transactions deleted successfully"
}
```


## WITHDRAWALS

### Create Withdrawal  
**Endpoint:** `POST /withdrawals` (Protected)  
**Description:** Creates a new withdrawal record for a campaign.  
**Sample Request:**
```bash
curl -X POST http://localhost:8080/withdrawals \
--header 'Authorization: Bearer <YOUR_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "campaign_id": "c579a44f-a23e-4eb8-957a-34a4d771960f",
  "amount": 250.00,
  "status": "pending"
}'
```
**Sample Response:**
```json
{
  "message": "Withdrawal created successfully",
  "withdrawal": {
    "ID": "<WITHDRAWAL_ID>",
    "CampaignID": "c579a44f-a23e-4eb8-957a-34a4d771960f",
    "Amount": 250.00,
    "Status": "pending",
    "ProcessedAt": null,
    "CreatedAt": "2025-03-04T01:00:00Z",
    "UpdatedAt": "2025-03-04T01:00:00Z"
  }
}
```

### Get Withdrawal by ID  
**Endpoint:** `GET /withdrawals/:id` (Protected)  
**Description:** Retrieves a withdrawal record by its unique ID.  
**Sample Request:**
```bash
curl -X GET http://localhost:8080/withdrawals/<WITHDRAWAL_ID> \
--header 'Authorization: Bearer <YOUR_TOKEN>'
```
**Sample Response:**
```json
{
  "withdrawal": {
    "ID": "<WITHDRAWAL_ID>",
    "CampaignID": "c579a44f-a23e-4eb8-957a-34a4d771960f",
    "Amount": 250.00,
    "Status": "pending",
    "ProcessedAt": null,
    "CreatedAt": "2025-03-04T01:00:00Z",
    "UpdatedAt": "2025-03-04T01:00:00Z"
  }
}
```

### List Withdrawals  
**Endpoint:** `GET /withdrawals?campaign_id=<CAMPAIGN_ID>` (Protected)  
**Description:** Lists all withdrawal records with an optional filter by campaign_id.  
**Sample Request:**
```bash
curl -X GET "http://localhost:8080/withdrawals?campaign_id=c579a44f-a23e-4eb8-957a-34a4d771960f" \
--header 'Authorization: Bearer <YOUR_TOKEN>'
```
**Sample Response:**
```json
{
  "withdrawals": [
    {
      "ID": "<WITHDRAWAL_ID>",
      "CampaignID": "c579a44f-a23e-4eb8-957a-34a4d771960f",
      "Amount": 250.00,
      "Status": "pending",
      "ProcessedAt": null,
      "CreatedAt": "2025-03-04T01:00:00Z",
      "UpdatedAt": "2025-03-04T01:00:00Z"
    }
  ]
}
```

### Update Withdrawal  
**Endpoint:** `PUT /withdrawals/:id` (Protected, Admin Only)  
**Description:** Updates a withdrawal record. Updatable fields include amount, status, and processed_at.  
**Sample Request:**
```bash
curl -X PUT http://localhost:8080/withdrawals/<WITHDRAWAL_ID> \
--header 'Authorization: Bearer <ADMIN_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "amount": 300.00,
  "status": "processed",
  "processed_at": "2025-03-04T02:00:00Z"
}'
```
**Sample Response:**
```json
{
  "message": "Withdrawal updated successfully",
  "withdrawal": {
    "ID": "<WITHDRAWAL_ID>",
    "CampaignID": "c579a44f-a23e-4eb8-957a-34a4d771960f",
    "Amount": 300.00,
    "Status": "processed",
    "ProcessedAt": "2025-03-04T02:00:00Z",
    "CreatedAt": "2025-03-04T01:00:00Z",
    "UpdatedAt": "2025-03-04T02:00:00Z"
  }
}
```

### Bulk Delete Withdrawals  
**Endpoint:** `DELETE /withdrawals/bulk` (Protected, Admin Only)  
**Description:** Deletes multiple withdrawal records by their IDs.  
**Sample Request:**
```bash
curl -X DELETE http://localhost:8080/withdrawals/bulk \
--header 'Authorization: Bearer <ADMIN_TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "ids": ["<WITHDRAWAL_ID_1>", "<WITHDRAWAL_ID_2>"]
}'
```
**Sample Response:**
```json
{
  "message": "Withdrawals deleted successfully"
}
```




# Driver Panel API Documentation

**Base URL:**

```
http://127.0.0.1:8000/api
```

---

## Authentication

All API endpoints require authentication via an access token. The token is stored in local storage under the key `"auth_token"`. Every request must include the token in the HTTP header as follows:

```
Authorization: Bearer <auth_token>
```

If the token is missing, expired, or invalid, the API will respond with a **401 Unauthorized** error.

---

## 1. Buy4Me Requests Endpoints

### 1.1. List All Buy4Me Requests Assigned to the Driver

- **HTTP Method:** GET
- **Endpoint:** `/accounts/driver/buy4me`
- **Description:** Retrieves a paginated list of Buy4Me requests assigned to the logged-in driver.
- **Headers:**
  - `Authorization: Bearer <auth_token>`
- **Query Parameters (Optional):**

  - `page`: For pagination (e.g., `?page=2`).

- **Sample Response:**

  ```json
  {
    "count": 123,
    "next": "http://api.example.org/accounts/?page=4",
    "previous": "http://api.example.org/accounts/?page=2",
    "results": [
      {
        "id": "string",
        "user": "string",
        "staff": "string",
        "driver": "string",
        "status": "DRAFT",
        "total_cost": "-99",
        "shipping_address": "string",
        "notes": "string",
        "items": [
          {
            "id": "string",
            "product_name": "string",
            "product_url": "string",
            "quantity": 9223372036854776000,
            "color": "string",
            "size": "string",
            "unit_price": "93096",
            "currency": "str",
            "notes": "string",
            "total_price": ".11",
            "created_at": "2025-03-09T10:03:58.674Z"
          }
        ],
        "created_at": "2025-03-09T10:03:58.674Z",
        "updated_at": "2025-03-09T10:03:58.674Z"
      }
    ]
  }
  ```

- **Exceptional Cases:**
  - **401 Unauthorized:** When the auth token is missing or invalid.
  - **500 Internal Server Error:** In case of unexpected server issues.

---

### 1.2. Update Buy4Me Request Status

- **HTTP Method:** POST
- **Endpoint:** `/accounts/driver/buy4me/{buy4me_request_id}/update/`
- **Description:** Updates the status (and optionally notes) of a specific Buy4Me request.
- **Headers:**
  - `Authorization: Bearer <auth_token>`
- **URL Parameter:**

  - `buy4me_request_id`: The unique identifier of the Buy4Me request.

- **Request Body Example:**

  ```json
  {
    "status": "ORDER_PLACED",
    "notes": "SOME NOTES"
  }
  ```

- **Sample Response:**

  ```json
  {
    "buy4me_request": {
      "id": "BUY254657",
      "user": "030889762041",
      "staff": null,
      "driver": "030889762041",
      "status": "ORDER_PLACED",
      "total_cost": "1136.00",
      "shipping_address": "zxv",
      "notes": "2025-03-09 10:12 - Status updated to ORDER_PLACED by 030889762041: SOME NOTES",
      "items": [
        {
          "id": "ITM251016",
          "product_name": "asdf",
          "product_url": "http://localhost:3000/buy4me",
          "quantity": 2,
          "color": "",
          "size": "",
          "unit_price": "23.00",
          "currency": "USD",
          "notes": "",
          "total_price": "46.00",
          "created_at": "2025-03-08T07:23:17.307438Z"
        },
        {
          "id": "ITM259592",
          "product_name": "asd",
          "product_url": "http://localhost:3000/buy4me",
          "quantity": 2,
          "color": "",
          "size": "",
          "unit_price": "322.00",
          "currency": "USD",
          "notes": "",
          "total_price": "644.00",
          "created_at": "2025-03-08T07:28:33.382821Z"
        },
        {
          "id": "ITM256846",
          "product_name": "asf",
          "product_url": "http://localhost:3000/buy4me",
          "quantity": 2,
          "color": "",
          "size": "",
          "unit_price": "223.00",
          "currency": "USD",
          "notes": "",
          "total_price": "446.00",
          "created_at": "2025-03-08T08:09:17.745541Z"
        }
      ],
      "created_at": "2025-03-07T01:51:48.919826Z",
      "updated_at": "2025-03-09T10:12:45.449777Z"
    },
    "message": "Buy4Me request status updated successfully"
  }
  ```

- **Exceptional Cases:**
  - **400 Bad Request:** If required fields (`status` or `notes`) are missing or invalid.
  - **401 Unauthorized:** If the auth token is missing or invalid.
  - **404 Not Found:** If the specified `buy4me_request_id` does not exist.

---

## 2. Driver Dashboard and Earnings

### 2.1. Get Driver Dashboard Details

- **HTTP Method:** GET
- **Endpoint:** `/accounts/driver/dashboard/`
- **Description:** Retrieves the driver’s profile and dashboard details, including pending deliveries, today’s earnings, and recent commissions.
- **Headers:**

  - `Authorization: Bearer <auth_token>`

- **Sample Response:**

  ```json
  {
    "driver_profile": {
      "id": "DPD257985",
      "user": "USR253322",
      "user_details": {
        "id": "USR253322",
        "email": "mudasiramin320@gmail.com",
        "username": "030889762041",
        "first_name": "Mudassar",
        "last_name": "Amin",
        "phone_number": "030889762041",
        "address": "",
        "user_type": "DRIVER",
        "is_verified": false,
        "country": 1,
        "preferred_currency": "USD",
        "date_joined": "2025-03-07T01:51:43Z",
        "country_details": {
          "id": 1,
          "name": "Pakistan",
          "code": "PK"
        },
        "default_shipping_method": "STS255110"
      },
      "vehicle_type": "CAR",
      "license_number": "65sds",
      "is_active": true,
      "commission_rate": "10.00",
      "total_earnings": "20.00",
      "total_deliveries": 0,
      "created_at": "2025-03-07T07:19:14.683839Z",
      "updated_at": "2025-03-09T10:16:20.019509Z"
    },
    "pending_deliveries": {
      "shipments": 1,
      "buy4me": 1,
      "total": 2
    },
    "earnings_today": 0,
    "recent_commissions": [
      {
        "id": "DCD255521",
        "driver": "DPD257985",
        "driver_details": "Driver: mudasiramin320@gmail.com",
        "delivery_type": "SHIPMENT",
        "reference_id": "sdf",
        "amount": "20.00",
        "earned_at": "2025-03-07T08:28:12.019612Z",
        "description": "asdf"
      }
    ]
  }
  ```

- **Exceptional Cases:**
  - **401 Unauthorized:** If the auth token is missing or invalid.
  - **404 Not Found:** If the driver profile is not available.

---

### 2.2. Get Driver Earnings

- **HTTP Method:** GET
- **Endpoint:** `/accounts/driver/earnings/`
- **Description:** Retrieves detailed earnings information including total earnings, breakdown by shipment and Buy4Me earnings, and a list of commission transactions.
- **Headers:**

  - `Authorization: Bearer <auth_token>`

- **Sample Response:**

  ```json
  {
    "total_earnings": 20,
    "shipment_earnings": 20,
    "buy4me_earnings": 0,
    "commissions": [
      {
        "id": "DCD255521",
        "driver": "DPD257985",
        "driver_details": "Driver: mudasiramin320@gmail.com",
        "delivery_type": "SHIPMENT",
        "reference_id": "sdf",
        "amount": "20.00",
        "earned_at": "2025-03-07T08:28:12.019612Z",
        "description": "asdf"
      }
    ]
  }
  ```

- **Exceptional Cases:**
  - **401 Unauthorized:** If the auth token is missing or invalid.

---

## 3. Driver Shipments Endpoints

### 3.1. Get Driver Assigned Shipments

- **HTTP Method:** GET
- **Endpoint:** `/accounts/driver/shipments/`
- **Description:** Retrieves a paginated list of shipments assigned to the logged-in driver.
- **Headers:**

  - `Authorization: Bearer <auth_token>`

- **Sample Response:**

  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": "SRS257301",
        "user": "mudasiramin320@gmail.com",
        "staff": null,
        "driver": "030889762041",
        "cod_amount": "4.99",
        "payment_method": "COD",
        "payment_status": "PENDING",
        "payment_date": null,
        "transaction_id": "",
        "receipt": "http://127.0.0.1:8000/media/shipment_receipts/TRK522307060/shipment_receipt_TRK522307060.pdf",
        "sender_name": "someone",
        "sender_email": "user@example.com",
        "sender_phone": "0308897622",
        "sender_address": "add",
        "recipient_name": "anotherone",
        "recipient_email": "user1@example.com",
        "recipient_phone": "033256558",
        "recipient_address": "adc",
        "package_type": "Box",
        "weight": "5.00",
        "length": "5.00",
        "width": "4.00",
        "height": "2.00",
        "description": "some description over there",
        "declared_value": "25.00",
        "insurance_required": true,
        "signature_required": true,
        "tracking_number": "TRK522307060",
        "current_location": "",
        "tracking_history": [
          {
            "status": "PENDING",
            "location": "Order Received",
            "timestamp": "2025-03-03T09:15:53.048932+00:00",
            "description": "Shipment request created"
          }
        ],
        "estimated_delivery": null,
        "status": "PENDING",
        "base_rate": "20.00",
        "per_kg_rate": "5.00",
        "weight_charge": "25.00",
        "service_charge": "50.00",
        "total_additional_charges": "0.00",
        "total_cost": "99.75",
        "notes": "some notes are there",
        "created_at": "2025-03-03T09:15:53.049939Z",
        "updated_at": "2025-03-07T08:29:17.992571Z",
        "sender_country": "CCC259878",
        "recipient_country": "CCC255512",
        "service_type": "STS255110"
      }
    ]
  }
  ```

- **Exceptional Cases:**
  - **401 Unauthorized:** If the auth token is missing or invalid.
  - **404 Not Found:** If no shipments are assigned or if the endpoint cannot locate the driver’s shipments.

---

### 3.2. Get Available Status Locations for Shipment Updates

- **HTTP Method:** GET
- **Endpoint:** `/accounts/driver/shipments/{shipment_id}/update/`
- **Description:** Returns the current shipment details and the list of available status locations (along with descriptive texts) that can be used to update the shipment status.
- **Headers:**
  - `Authorization: Bearer <auth_token>`
- **URL Parameter:**

  - `shipment_id`: The unique identifier for the shipment.

- **Sample Response:**

  ```json
  {
    "shipment": {
      "id": "SRS257301",
      "tracking_number": "TRK522307060",
      "current_status": "PENDING",
      "current_location": ""
    },
    "available_status_locations": [
      {
        "id": 1,
        "status_type": "PENDING",
        "status_type_display": "Pending",
        "location_name": "New Order",
        "description": "Shipment request created",
        "display_order": 10
      },
      {
        "id": 2,
        "status_type": "PROCESSING",
        "status_type_display": "Processing",
        "location_name": "Processing Center",
        "description": "Shipment is being processed",
        "display_order": 20
      },
      {
        "id": 3,
        "status_type": "PICKED_UP",
        "status_type_display": "Picked Up",
        "location_name": "Pickup Location",
        "description": "Package picked up from sender",
        "display_order": 30
      },
      {
        "id": 4,
        "status_type": "PICKED_UP",
        "status_type_display": "Picked Up",
        "location_name": "Sender Address",
        "description": "Package collected from sender address",
        "display_order": 31
      },
      {
        "id": 5,
        "status_type": "IN_TRANSIT",
        "status_type_display": "In Transit",
        "location_name": "Origin Sorting Center",
        "description": "Package arrived at origin sorting center",
        "display_order": 40
      },
      {
        "id": 6,
        "status_type": "IN_TRANSIT",
        "status_type_display": "In Transit",
        "location_name": "In Transit",
        "description": "Package in transit to destination",
        "display_order": 41
      },
      {
        "id": 7,
        "status_type": "IN_TRANSIT",
        "status_type_display": "In Transit",
        "location_name": "Destination Sorting Center",
        "description": "Package arrived at destination sorting center",
        "display_order": 42
      },
      {
        "id": 8,
        "status_type": "OUT_FOR_DELIVERY",
        "status_type_display": "Out for Delivery",
        "location_name": "Local Delivery Center",
        "description": "Package at local delivery center",
        "display_order": 50
      },
      {
        "id": 9,
        "status_type": "OUT_FOR_DELIVERY",
        "status_type_display": "Out for Delivery",
        "location_name": "Destination City",
        "description": "Out for delivery",
        "display_order": 51
      },
      {
        "id": 10,
        "status_type": "DELIVERED",
        "status_type_display": "Delivered",
        "location_name": "Recipient Address",
        "description": "Package delivered to recipient",
        "display_order": 60
      },
      {
        "id": 11,
        "status_type": "DELIVERED",
        "status_type_display": "Delivered",
        "location_name": "Pickup Point",
        "description": "Package delivered to pickup point",
        "display_order": 61
      },
      {
        "id": 12,
        "status_type": "CANCELLED",
        "status_type_display": "Cancelled",
        "location_name": "Cancelled",
        "description": "Shipment has been cancelled",
        "display_order": 70
      }
    ]
  }
  ```

- **Exceptional Cases:**
  - **401 Unauthorized:** If the auth token is missing or invalid.
  - **404 Not Found:** If the shipment with the provided `shipment_id` does not exist.

---

### 3.3. Update Shipment Status

- **HTTP Method:** POST
- **Endpoint:** `/accounts/driver/shipments/{shipment_id}/update/`
- **Description:** Updates the shipment status by assigning a new status location. An optional custom description can be provided.
- **Headers:**
  - `Authorization: Bearer <auth_token>`
- **URL Parameter:**
  - `shipment_id`: The unique identifier for the shipment.
- **Request Body Example:**

  ```json
  {
    "status_location_id": 3,
    "custom_description": "some description"
  }
  ```

- **Sample Response:**

  ```json
  {
    "shipment": {
      "id": "SRS257301",
      "user": "mudasiramin320@gmail.com",
      "staff": null,
      "driver": "030889762041",
      "cod_amount": "4.99",
      "payment_method": "COD",
      "payment_status": "PENDING",
      "payment_date": null,
      "transaction_id": "",
      "receipt": "/media/shipment_receipts/TRK522307060/shipment_receipt_TRK522307060.pdf",
      "sender_name": "someone",
      "sender_email": "user@example.com",
      "sender_phone": "0308897622",
      "sender_address": "add",
      "recipient_name": "anotherone",
      "recipient_email": "user1@example.com",
      "recipient_phone": "033256558",
      "recipient_address": "adc",
      "package_type": "Box",
      "weight": "5.00",
      "length": "5.00",
      "width": "4.00",
      "height": "2.00",
      "description": "some description over there",
      "declared_value": "25.00",
      "insurance_required": true,
      "signature_required": true,
      "tracking_number": "TRK522307060",
      "current_location": "Pickup Location",
      "tracking_history": [
        {
          "status": "PENDING",
          "location": "Order Received",
          "timestamp": "2025-03-03T09:15:53.048932+00:00",
          "description": "Shipment request created"
        },
        {
          "status": "PICKED_UP",
          "location": "Pickup Location",
          "timestamp": "2025-03-09T10:21:29.564080+00:00",
          "description": "some description",
          "updated_by": "030889762041",
          "staff_id": "USR253322"
        }
      ],
      "estimated_delivery": null,
      "status": "PICKED_UP",
      "base_rate": "20.00",
      "per_kg_rate": "5.00",
      "weight_charge": "25.00",
      "service_charge": "50.00",
      "total_additional_charges": "0.00",
      "total_cost": "99.75",
      "notes": "some notes are there",
      "created_at": "2025-03-03T09:15:53.049939Z",
      "updated_at": "2025-03-09T10:21:29.565078Z",
      "sender_country": "CCC259878",
      "recipient_country": "CCC255512",
      "service_type": "STS255110"
    },
    "message": "Shipment status updated successfully"
  }
  ```

- **Exceptional Cases:**
  - **400 Bad Request:** If the request body is missing required fields (`status_location_id`) or if the provided data is invalid.
  - **401 Unauthorized:** If the auth token is missing or invalid.
  - **404 Not Found:** If the shipment with the specified `shipment_id` is not found.

---

## Additional Notes on Exceptional Handling

- **Validation Errors:**  
  In cases where the request payload does not meet the expected schema, the API will respond with a **400 Bad Request** status, accompanied by details about the fields that failed validation.

- **Token Expiry or Invalid Token:**  
  Requests without a valid token will result in a **401 Unauthorized** response. Ensure that the token is refreshed or re-authenticated as needed.

- **Not Found Errors:**  
  If the requested resource (e.g., a specific shipment or Buy4Me request) does not exist, a **404 Not Found** response is returned.

- **Server Errors:**  
  Unexpected errors on the server side will typically return a **500 Internal Server Error**. Logging and exception handling are managed using Django REST Framework’s built-in exception handlers.

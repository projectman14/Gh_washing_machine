# System Architecture and Database Design

## System Architecture
The application will follow a client-server architecture:
- **Frontend**: Built with HTML, CSS, and JavaScript, providing the user interface for booking and administration.
- **Backend**: Developed using Python (Flask framework) to handle API requests, manage data, and implement business logic.
- **Database**: SQLite will be used for local data storage due to its simplicity and file-based nature, suitable for localhost deployment.

## Database Design

### 1. Users Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT (Unique user identifier)
- `student_id`: TEXT UNIQUE NOT NULL (LNMIIT Student ID)
- `username`: TEXT NOT NULL
- `password`: TEXT NOT NULL (Hashed password)
- `role`: TEXT NOT NULL (e.g., 'user', 'admin')

### 2. Washing_Machines Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT (Unique machine identifier)
- `machine_name`: TEXT NOT NULL (e.g., 'Machine 1', 'Machine 2')
- `status`: TEXT NOT NULL (e.g., 'available', 'in_use', 'broken')
- `last_used_by`: INTEGER (Foreign key to Users.id, nullable)
- `last_used_time`: DATETIME (Nullable)

### 3. Bookings Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT (Unique booking identifier)
- `user_id`: INTEGER NOT NULL (Foreign key to Users.id)
- `machine_id`: INTEGER NOT NULL (Foreign key to Washing_Machines.id)
- `start_time`: DATETIME NOT NULL
- `end_time`: DATETIME NOT NULL
- `status`: TEXT NOT NULL (e.g., 'pending', 'confirmed', 'completed', 'cancelled')



# EMS Pro — Employee Management System

A full-stack enterprise-grade Employee Management System built with **Spring Boot 3**, **React 18**, and **MySQL**.

---

## Project Structure

```
Employee_Management_System/
├── backend/          ← Spring Boot REST API (Java 17, Port 8080)
│   ├── src/main/java/com/ems/
│   │   ├── config/         (SecurityConfig, SchedulerConfig, DataInitializer)
│   │   ├── controller/     (10 REST controllers incl. Scheduler)
│   │   ├── dto/            (LoginRequest, LoginResponse, DashboardStats)
│   │   ├── entity/         (10 JPA entities incl. SchedulerJobConfig)
│   │   ├── exception/      (GlobalExceptionHandler)
│   │   ├── repository/     (10 JPA repositories)
│   │   ├── security/       (JWT provider + filter + UserDetails)
│   │   └── service/        (11 business services incl. SchedulerService)
│   └── pom.xml
│
└── frontend/         ← React + Vite SPA (Port 5173)
    └── src/
        ├── api/            (axiosConfig, services)
        ├── components/     (Sidebar, TopBar, Toggle)
        ├── context/        (AuthContext, ThemeContext)
        └── pages/          (10 feature pages incl. Settings)
```

---

## Quick Start

### Prerequisites

| Tool       | Version  |
|------------|----------|
| Java       | 17+      |
| Maven      | 3.8+ (or use `mvnw.cmd`) |
| Node.js    | 16+      |
| MySQL      | 8.0+     |

> **Windows:** Set `JAVA_HOME` to your JDK path (e.g. `C:\Program Files\Java\jdk-20`) before running `mvnw.cmd`.

---

### 1. Database Setup

```sql
CREATE DATABASE ems_db;
```

> The app uses `spring.jpa.hibernate.ddl-auto=update` — tables are created on first run.

---

### 2. Backend Setup

```bash
cd backend

# Update DB password in src/main/resources/application.properties
# spring.datasource.password=YOUR_PASSWORD

# Run (Windows)
mvnw.cmd spring-boot:run

# Run (Linux/Mac or if Maven is installed)
mvn spring-boot:run

# Build jar
mvnw.cmd clean package -DskipTests
java -jar target/ems-backend-1.0.0.jar
```

The API starts at **http://localhost:8080**

---

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

The UI starts at **http://localhost:5173**

---

## Default Login Credentials

| Username | Password    | Role     |
|----------|-------------|----------|
| admin    | admin123    | ADMIN    |
| priya    | password123 | EMPLOYEE |
| anjali   | password123 | MANAGER  |
| arjun    | password123 | MANAGER  |

> All sample employees can log in as `firstname` / `password123`

---

## Features

| Module          | Features                                                                 |
|-----------------|--------------------------------------------------------------------------|
| **Auth**        | JWT login, role-based access (ADMIN/MANAGER/HR/EMPLOYEE)                |
| **Dashboard**   | Stat cards, department pie chart, bar chart, recent activity feed       |
| **Employees**   | Add/Edit/Delete, search, filter, **active/inactive toggle**             |
| **Departments** | Department cards with headcount, manager, budget                        |
| **Leave**       | Apply, Approve/Reject, filter by status                                 |
| **Attendance**  | Check-in/out, monthly report, status tracking                           |
| **Salary**      | Payroll records, allowances, deductions, auto net-pay calc            |
| **Performance** | 5-star reviews across 6 dimensions, recommendations                     |
| **Announcements**| Priority board, **active/inactive toggle**, color-coded urgency        |
| **Settings**    | **Dark/Light theme toggle**, scheduler job management (admin)           |
| **Scheduler**   | Auto-mark absent, expire announcements, monthly salary gen, daily summary |
| **Audit Logs**  | Full system activity trail (ADMIN only)                                 |

### UI Enhancements

- **Sidebar collapse toggle** — expand/collapse navigation
- **Dark / Light theme** — persisted in localStorage, toggle from top bar or Settings
- **Notification bell** — shows urgent/high-priority announcements
- **Global search** — search employees from the top bar
- **Toggle switches** — employee active status, announcement visibility, scheduler jobs

---

## Scheduled Jobs

Managed from **Settings → Scheduled Jobs** (admin only). Jobs can be enabled/disabled or run manually.

| Job                    | Schedule              | Description                                      |
|------------------------|-----------------------|--------------------------------------------------|
| Auto Mark Absent       | Daily 10:00 PM        | Marks employees absent if no check-in recorded   |
| Expire Announcements   | Daily midnight        | Deactivates announcements past expiry date       |
| Generate Monthly Salaries | 1st of month 1:00 AM | Creates salary records for all active employees  |
| Daily Attendance Summary | Daily 6:00 PM      | Logs present vs active count to audit trail      |

---

## API Endpoints

| Resource        | Base URL              |
|-----------------|-----------------------|
| Auth            | `/api/auth`           |
| Employees       | `/api/employees`      |
| Departments     | `/api/departments`    |
| Leave           | `/api/leaves`         |
| Attendance      | `/api/attendance`     |
| Salary          | `/api/salaries`       |
| Performance     | `/api/performance`    |
| Announcements   | `/api/announcements`  |
| Dashboard       | `/api/dashboard`      |
| Scheduler       | `/api/scheduler`      |

### Key Toggle Endpoints

| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| PATCH  | `/api/employees/{id}/toggle-status` | Toggle ACTIVE ↔ INACTIVE       |
| PATCH  | `/api/announcements/{id}/toggle`      | Toggle announcement visibility |
| PATCH  | `/api/scheduler/jobs/{key}/toggle`    | Enable/disable a scheduled job |
| POST   | `/api/scheduler/jobs/{key}/run`       | Run a scheduled job manually   |

**Swagger UI**: http://localhost:8080/swagger-ui.html

---

## Tech Stack

**Backend:** Spring Boot 3.2.4 · Spring Security · JWT (jjwt 0.11.5) · JPA/Hibernate · MySQL · Lombok · OpenAPI/Swagger · `@EnableScheduling`

**Frontend:** React 18 · Vite 5 · React Router 6 · Axios · Recharts · React Icons · React Hot Toast

---

## Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JWT (change in production!)
app.jwt.secret=YourSecretKey
app.jwt.expiration=86400000   # 24 hours in ms

# Port
server.port=8080
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API returns 500 on employee/department fetch | Fixed — circular JSON reference on `Department.employees` resolved with `@JsonIgnore` |
| Scheduler jobs not running | Ensure `@EnableScheduling` is active (enabled in `EmsApplication`) and jobs are toggled ON in Settings |
| `mvnw.cmd` fails on Windows | Set `JAVA_HOME` to your JDK folder (not the `javapath` symlink) |
| Frontend can't reach API | Confirm backend is running on port 8080 and MySQL is up |
| Login fails | Use seeded credentials; check `spring.datasource.password` matches your MySQL root password |

---

## License

MIT — free to use and modify.

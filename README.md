# 🧾 Reservation Bot (NestJS)

- A simple reservation system built with **NestJS**.
- It supports creating new reservations, updating them, and cancelling them.
- A CLI bot is included for interacting with the system.

---

## 🚀 Tech Stack

- **Node.js**
- **NestJS**
- **TypeScript**
- **Axios** (for CLI bot calls)
- **class-validator**
- **JSON file storage** (`reservations.json`, `availability.json`)

---

## 📦 Setup Guide

### 1️⃣ Clone the repository

```bash
git clone git@github.com:amalrasas/reservation-bot.git
cd reservation-bot
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the API server

```bash
npm run start
```

The server will run on:

```
http://localhost:3000
```

### 4️⃣ Start the CLI bot

```bash
npm run bot
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```
PORT=3000
BASE_URL=http://localhost:3000
MAX_CAPACITY_PER_SLOT=20
```

- `PORT`: The port your NestJS API will run on
- `BASE_URL`: Used by the CLI bot to call your API
- `MAX_CAPACITY_PER_SLOT`: Default number of people allowed per time slot

---

## 🤖 Reservation Bot (CLI)

The interactive CLI bot supports:

- Creating a new reservation
- Updating an existing reservation
- Cancelling a reservation
- Viewing availability

It validates:

- Dates
- Phone Number
- Time slots
- Number of people

Run it any time using:

```bash
npm run bot
```

---

## 🗂 Data Storage

The project stores data in two JSON files:

### `reservations.json`

Contains all reservation objects created by users.

### `availability.json`

Contains generated availability and time slot capacities.

No external database or third-party services are required.

---

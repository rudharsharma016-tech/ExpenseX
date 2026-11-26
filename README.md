# 💰 ExpenseX – Personal Expense Tracker

ExpenseX is a mobile expense management application developed using React Native and Expo. It helps users manage their daily income and expenses, track transactions, view financial statistics, and convert currencies through a simple and user-friendly interface.

## 📱 Project Overview

ExpenseX provides users with an easy way to record and monitor their financial activities. It uses Firebase for user authentication and cloud database management.

## ✨ Features

- **User Authentication:** Secure user registration and login.
- **Dashboard:** View income, expenses, and financial summaries.
- **Add Transaction:** Record income and expense transactions.
- **Transaction History:** View and edit previously added transactions.
- **Statistics:** Monitor income and expenses through financial summaries.
- **Currency Converter:** Convert between Indian Rupees (INR) and US Dollars (USD).
- **Profile Management:** View user account information.
- **Firebase Integration:** Store and manage transaction data using Cloud Firestore.
- **Navigation:** Easy navigation between different application screens.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React Native | Mobile application development |
| Expo | Development and application running |
| JavaScript | Programming language |
| Firebase Authentication | User authentication |
| Firebase Firestore | Cloud database |
| React Native Paper | UI components and design |
| React Navigation | Application navigation |
| AsyncStorage | Local data storage |
| External Currency API | Currency conversion |

## 📂 Project Structure

```text
ExpenseX/
│
├── assets/
│   ├── icon.png
│   └── splash.png
│
├── src/
│   └── services/
│       ├── firebaseConfig.js
│       ├── authService.js
│       ├── currencyService.js
│       └── screens/
│
├── App.js
├── index.js
├── app.json
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rudharsharma016-tech/ExpenseX.git
```

### 2. Open the Project Folder

```bash
cd ExpenseX
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Firebase

- Create a Firebase project.
- Enable Firebase Authentication.
- Create a Cloud Firestore database.
- Configure your Firebase credentials in `src/services/firebaseConfig.js`.

### 5. Run the Application

```bash
npx expo start
```

Open the application using Expo Go or an appropriate development environment.

## 🔥 Firebase Services

ExpenseX uses Firebase services for:

- User registration and login.
- Cloud Firestore database integration.
- Storing and retrieving user transaction records.

## 🎯 Project Objective

The main objective of ExpenseX is to provide a simple and efficient mobile application that helps users maintain their financial records, monitor spending habits, and manage their income and expenses.

## 👨‍💻 Developer

**Name:** Rudhar Sharma

**Project:** ExpenseX – Personal Expense Tracker

**Department:** Information Technology

**Course:** Bachelor of Engineering (BE)

## 📜 License

This project is developed for academic purposes.
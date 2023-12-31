module.exports = {
    GENERAL: {
        CANCEL: "Cancel ❌",
        BACK_TO_MENU: "🔙 Back to Main Menu",
        CANCEL_ACTION: "❌ Action Canceled",
        ERROR_INVALID_NUMBER: "❌ Invalid number entered",
        ERROR_ADMIN: "❌ You are not an admin",
        CURRENCY: "$",
        NEXT: "Next →",
        PREV: "← Prev",
        BOT_COMMANDS: [
            { command: "expense", description: "Add a new expense 💸" },
            { command: "income", description: "Add a new income 💰" },
            { command: "status", description: "Monthly expense and income summary 📑" },
            { command: "categories", description: "Expense breakdown by categories 🗂" },
            { command: "settings", description: "Settings menu for editing details ⚙️" },
        ],
    },
    EXPENSE: {
        PROMPT_NAME: "✏️ Enter the expense name:",
        PROMPT_CATEGORY: "📚 Enter the expense category:",
        PROMPT_COST: "💰 Enter the expense amount:",
        SUCCESS_ADDING: "✅ Expense added successfully!",
        ERROR_CREATING: "❌ Failed to create expense",
        ERROR_ADDING: "❌ Failed to add expense",
    },
    INCOME: {
        PROMPT_NAME: "✏️ Enter the income name:",
        PROMPT_AMOUNT: "💰 Enter the income amount:",
        SUCCESS_ADDING: "✅ Income added successfully!",
        ERROR_CREATING: "❌ Failed to create income",
        ERROR_ADDING: "❌ Failed to add income",
    },
    FAMILY: {
        PROMPT_RENAME: "✒️ What is the new family name you want?",
        PROMPT_EDIT_DAY: "📅 What is the first day of the month you want to set? (1-31)",
        SUCCESS_ADDING: "✅ Family added successfully!",
        SUCCESS_MEMBER_ADDING: "✅ Family member added successfully!",
        SUCCESS_MEMBER_REMOVING: "✅ Family member removed successfully!",
        SUCCESS_RENAME: "✅ Your family name has been successfully changed to ",
        SUCCESS_EDIT_DAY: "✅ Successfully set. From now on, expenses and incomes will be counted from the ",
        SUCCESS_EDIT_LIMIT: "✅ Successfully set! The new monthly target for the category is ",
        ERROR_NOT_FOUND: "❌ No family linked to the user found",
        ERROR_FOUND: "❌ Family linked to the user found",
        ERROR_WRONG_FAMILY: "❌ Incorrect user or family",
        ERROR_RENAME: "❌ Error in setting the family name. Please try again.",
        ERROR_EDIT_DAY: "❌ Error in setting the chosen day. Please try again.",
        ERROR_EDIT_LIMIT: "❌ Error in setting the monthly target for the category. Please try again.",
    },
    CATEGORY: {
        PROMPT_ADD: "✏️ What is the new category name?",
        PROMPT_DELETE: "📚 Select a category to delete",
        PROMPT_EDIT: "📚 Select a category to edit:",
        PROMPT_NEW_NAME: "✏️ What is the new name for the category?",
        PROMPT_NEW_LIMIT: "💵 What is the monthly target for the category?",
        SUCCESS_ADDING: "✅ Category added successfully.",
        SUCCESS_DELETING: "✅ Category deleted successfully.",
        SUCCESS_EDITING: "✅ Category edited successfully.",
        ERROR_NO_CATEGORIES: "❌ No categories found for the family",
        ERROR_NOT_FOUND: "❌ The requested category was not found",
        DEFAULT: [
            { name: "Groceries 🛒", monthlyLimit: 0 },
            { name: "Rent 🏠", monthlyLimit: 0 },
            { name: "Car Expenses 🚗", monthlyLimit: 0 },
            { name: "Pet Expenses 🐱", monthlyLimit: 0 },
            { name: "Utilities 💡", monthlyLimit: 0 },
            { name: "Entertainment 🎬", monthlyLimit: 0 },
            { name: "Savings 💰", monthlyLimit: 0 },
            { name: "Dining Out 🍔", monthlyLimit: 0 },
        ],
    },
    INSIGHT: {
        MESSAGE_STATUS: "📊 Expense vs. Income Balance",
        MESSAGE_SUMMARY: "Monthly Summary for ",
        MESSAGE_EXPENSES: "💼 Expenses",
        MESSAGE_TOTAL_EXPENSES: "💵 Total Expenses",
        MESSAGE_INCOMES: "💰 Incomes",
        MESSAGE_TOTAL_INCOMES: "💵 Total Incomes",
        MESSAGE_MONTHLY_CHANGE: "📈 Monthly Change",
        MESSAGE_BY_CATEGORIES: "📊 Expense Breakdown by Category",
        MESSAGE_EXPENSIVE_DAY: "📆 The most expensive day of the week",
        MESSAGE_TOTAL: "Total",
        MESSAGE_OUT_OF: "out of",
        WEEK_DAYS: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        ERROR_STATUS: "❌ Failed to calculate expenses and incomes, please try again later",
        ERROR_NOT_FOUND: "🤷‍♂️ No expenses found to perform the requested search",
    },
    MENU: {
        MAIN: {
            CONTENT: `*Settings Menu ⚙️*
Welcome to the settings menu, please select an option from the menu: \n
🔸 👨‍👩‍👧‍👦 Family: Edit family name and first day of the month.
🔸 📚 Categories: creating and deleting categories, editing the name of the category and editing its monthly target.
🔸 💰 Income (Coming Soon).
🔸 💰 💼 Expense (Coming Soon).
🔸 📊 Insights (Coming Soon).`,
            BUTTONS: [
                [{ text: "👨‍👩‍👧‍👦 Family", callback_data: "menu_family" }],
                [{ text: "📚 Categories", callback_data: "menu_category" }],
                [{ text: "📊 Insights (Coming Soon)", callback_data: "menu_insights" }],
                [
                    { text: "💰 Income (Coming Soon)", callback_data: "menu_income" },
                    { text: "💼 Expense (Coming Soon)", callback_data: "menu_expense" },
                ],
                [{ text: "❌ Exit", callback_data: "menu_done" }],
            ],
        },
        FAMILY: {
            CONTENT: `*Family Menu 👨‍👩‍👧‍👦*
Welcome to the family menu, please select an option from the menu: \n
🔸 📝 Edit Family Name
🔸 📅 Edit First Day of the Month - the first day from which expenses are counted`,
            BUTTONS: [
                [{ text: "📝 Edit Family Name", callback_data: "family_editname" }],
                [{ text: "📅 Edit First Day of the Month", callback_data: "family_setday" }],
                [{ text: "🔙 Back to Main Menu", callback_data: "back_to_main_menu" }],
            ],
        },
        CATEGORY: {
            CONTENT: `*Category Menu 📚*
Welcome to the category menu, please select an option from the menu: \n
🔸 ➕ Add New Expense Category
🔸 💵 Set Monthly Target for a Category to manage your monthly expenses
🔸 📝 Edit Category Name (Does not affect previous expenses)
🔸 ❌ Remove Category`,
            BUTTONS: [
                [{ text: "➕ Add New Category", callback_data: "category_add" }],
                [{ text: "📝 Edit Category Name", callback_data: "category_rename" }],
                [{ text: "💵 Edit Category Target", callback_data: "category_set_limit" }],
                [{ text: "❌ Remove Category", callback_data: "category_remove" }],
                [{ text: "🔙 Back to Main Menu", callback_data: "back_to_main_menu" }],
            ],
        },
        EXPENSE: {
            CONTENT: "*Expense Menu 💼*\nThis menu will be available soon.",
            BUTTONS: [
                [
                    { text: "❌ Delete Expense", callback_data: "delete_expense" },
                    { text: "📝 Edit Expense", callback_data: "edit_expense" },
                ],
                [{ text: "🔙 Back to Main Menu", callback_data: "back_to_main_menu" }],
            ],
        },
        INCOME: {
            CONTENT: "*Income Menu 💰*\nThis menu will be available soon.",
            BUTTONS: [
                [
                    { text: "❌ Delete Income", callback_data: "delete_expense" },
                    { text: "📝 Edit Income", callback_data: "edit_expense" },
                ],
                [{ text: "🔙 Back to Main Menu", callback_data: "back_to_main_menu" }],
            ],
        },
        INSIGHTS: {
            CONTENT: "*Insights Menu 📊*\nThis menu will be available soon.",
            BUTTONS: [
                [
                    { text: "📊 Expense vs. Income Balance", callback_data: "insights_status" },
                    { text: "⭕ Expenses by Category", callback_data: "insights_categories" },
                ],
                [
                    { text: "📈 Monthly Change", callback_data: "insights_monthly_change" },
                    { text: "📅 Most Expensive Day of the Week", callback_data: "insights_expensive_day" },
                ],
                [{ text: "🔙 Back to Main Menu", callback_data: "back_to_main_menu" }],
            ],
        },
    },
};

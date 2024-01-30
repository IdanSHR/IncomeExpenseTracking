module.exports = {
    GENERAL: {
        CANCEL: "ביטול ❌",
        BACK_TO_MENU: "🔙 חזרה לתפריט הראשי",
        CANCEL_ACTION: "❌ הפעולה בוטלה",
        ERROR_INVALID_NUMBER: "❌ יש להכניס מספר תקני",
        ERROR_ADMIN: "❌ אינך מנהל",
        CURRENCY: "₪",
        NEXT: "הבא ←",
        PREV: "→ הקודם",
        BOT_COMMANDS: [
            { command: "expense", description: "הוספת הוצאה חדשה 💸" },
            { command: "income", description: "הוספת הכנסה חדשה 💰" },
            { command: "status", description: "סיכום הוצאות הכנסות החודשי 📑" },
            { command: "categories", description: "חלוקת ההוצאות לפי קטגוריות 🗂" },
            { command: "settings", description: "תפריט הגדרות לעריכת הפרטים ⚙️" },
        ],
    },
    EXPENSE: {
        PROMPT_NAME: "✏️ יש להכניס את שם ההוצאה:",
        PROMPT_CATEGORY: "📚 יש להכניס את קטגוריית ההוצאה:",
        PROMPT_COST: "💰 יש להכניס את עלות ההוצאה:",
        SUCCESS_ADDING: "✅ ההוצאה נוספה בהצלחה!",
        SUCCESS_DELETING: "✅ ההוצאה נמחקה בהצלחה.",
        ERROR_CREATING: "❌ נכשל ביצירת הוצאה",
        ERROR_ADDING: "❌ נכשל בהוספת הוצאה",
        ERROR_DELETING: "❌ נכשל במחיקת הוצאה",
        ERROR_NO_EXPENSES_CATEGORY: "❌ לא נמצאו הוצאות לקטגוריה זו מהזמן האחרון",
    },
    INCOME: {
        PROMPT_NAME: "✏️ יש להכניס את שם ההכנסה:",
        PROMPT_AMOUNT: "💰 יש להכניס את סכום ההכנסה:",
        SUCCESS_ADDING: "✅ ההכנסה נוספה בהצלחה!",
        SUCCESS_DELETING: "✅ ההכנסה נמחקה בהצלחה.",
        ERROR_CREATING: "❌ נכשל ביצירת הכנסה",
        ERROR_ADDING: "❌ נכשל בהוספת הכנסה",
        ERROR_NO_INCOMES: "❌ לא נמצאו הכנסות מהזמן האחרון",
    },
    FAMILY: {
        PROMPT_RENAME: "✒️ מהו שם המשפחה החדש שתרצו?",
        PROMPT_EDIT_DAY: "📅 מהו היום בחודש בו תרצה להתחיל? (1-31)",
        SUCCESS_ADDING: "✅ משפחה נוספה בהצלחה!",
        SUCCESS_MEMBER_ADDING: "✅ חבר המשפחה נוסף בהצלחה!",
        SUCCESS_MEMBER_REMOVING: "✅ חבר המשפחה הוסר בהצלחה!",
        SUCCESS_RENAME: "✅ שם המשפחה שלך שונה בהצלחה ל-",
        SUCCESS_EDIT_DAY: "✅ הוגדר בהצלחה. מעכשיו הוצאות והכנסות יספרו מה-",
        SUCCESS_EDIT_LIMIT: "✅ הוגדר בהצלחה! היעד החדש של הקטגוריה הוא-",
        ERROR_NOT_FOUND: "❌ לא נמצאה משפחה מקושרת למשתמש",
        ERROR_FOUND: "❌ נמצאה משפחה מקושרת למשתמש",
        ERROR_WRONG_FAMILY: "❌ משתמש או משפחה לא נכונים",
        ERROR_RENAME: "❌ שגיאה בהגדרת שם המשפחה. יש לנסות שנית.",
        ERROR_EDIT_DAY: "❌ שגיאה בהגדרת היום שבחרת. יש לנסות שנית.",
        ERROR_EDIT_LIMIT: "❌ שגיאה בהגדרת יעד חודשי לקטגוריה. יש לנסות שנית.",
    },
    CATEGORY: {
        PROMPT_ADD: "✏️ מה שם הקטגוריה החדשה?",
        PROMPT_DELETE: "📚 יש לבחור קטגוריה למחיקה",
        PROMPT_EDIT: "📚 יש לבחור קטגוריה לעדכון:",
        PROMPT_NEW_NAME: "✏️ מה השם החדש של הקטגוריה?",
        PROMPT_NEW_LIMIT: "💵 מהו היעד החודשי לקטגוריה?",
        SUCCESS_ADDING: "✅ הקטגוריה נוספה בהצלחה.",
        SUCCESS_DELETING: "✅ הקטגוריה נמחקה בהצלחה.",
        SUCCESS_EDITING: `✅ הקטגוריה נערכה בהצלחה.`,
        ERROR_NO_CATEGORIES: "❌ לא נמצאו קטגוריות למשפחה",
        ERROR_NOT_FOUND: "❌ הקטגורייה המבוקשת לא נמצאה",
        DEFAULT: [
            { name: "קניות בסופר 🛒", monthlyLimit: 0 },
            { name: "שכירות 🏠", monthlyLimit: 0 },
            { name: "הוצאות רכב 🚗", monthlyLimit: 0 },
            { name: "הוצאות חיות מחמד 🐱", monthlyLimit: 0 },
            { name: "שירותים 💡", monthlyLimit: 0 },
            { name: "פנאי 🎬", monthlyLimit: 0 },
            { name: "חיסכון 💰", monthlyLimit: 0 },
            { name: "אוכל בחוץ 🍔", monthlyLimit: 0 },
        ],
    },
    INSIGHT: {
        MESSAGE_STATUS: "📊 מאזן הוצאות מול הכנסות",
        MESSAGE_SUMMARY: "סיכום חודשי של ",
        MESSAGE_EXPENSES: "💼 הוצאות",
        MESSAGE_TOTAL_EXPENSES: '💵 סה"כ הוצאות',
        MESSAGE_INCOMES: "💰 הכנסות",
        MESSAGE_TOTAL_INCOMES: '💵 סה"כ הכנסות',
        MESSAGE_MONTHLY_CHANGE: "📈 שינוי חודשי",
        MESSAGE_BY_CATEGORIES: "📊 חלוקת הוצאות לפי קטגוריה",
        MESSAGE_EXPENSIVE_DAY: "📆 היום הכי יקר בשבוע",
        MESSAGE_TOTAL: 'סה"כ',
        MESSAGE_OUT_OF: "מתוך",
        WEEK_DAYS: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
        ERROR_STATUS: "❌ נכשל בחישוב ההוצאות וההכנסות, יש לנסות שנית מאוחר יותר",
        ERROR_NOT_FOUND: "🤷‍♂️ לא נמצאו הוצאות על מנת לבצע את החיפוש המבוקש",
    },
    MENU: {
        MAIN: {
            CONTENT: `*תפריט הגדרות ⚙️*
ברוכים הבאים לתפריט ההגדרות, יש לבחור אופציה מהתפריט: \n
🔸 👨‍👩‍👧‍👦 משפחה: עריכת שם המשפחה והיום הראשון לחודש.
🔸 📚 קטגוריות: יצירה, עריכה ומחיקת קטגוריות וקביעת יעד חודשי.
🔸 💰 הכנסות: עריכה ומחיקה של הכנסות מהתקופה האחרונה.
🔸 💰 💼 הוצאות: עריכה, קביעת הוצאה חודשית חוזרת ומחיקת הוצאות מהזמן האחרון.
🔸 📊 סטטיסטיקות (בקרוב).`,
            BUTTONS: [
                [{ text: "👨‍👩‍👧‍👦 משפחה", callback_data: "menu_family" }],
                [{ text: "📚 קטגוריות", callback_data: "menu_category" }],
                [{ text: "📊 סטטיסטיקות (בקרוב)", callback_data: "menu_insights" }],
                [
                    { text: "💰 הכנסות", callback_data: "menu_income" },
                    { text: "💼 הוצאות", callback_data: "menu_expense" },
                ],
                [{ text: "❌ סיום", callback_data: "menu_done" }],
            ],
        },
        FAMILY: {
            CONTENT: `*תפריט משפחות 👨‍👩‍👧‍👦*
ברוכים הבאים לתפריט המשפחות, יש לבחור אופציה מהתפריט: \n
🔸 📝 עריכת שם המשפחה
🔸 📅 עריכת היום ראשון לחודש - היום הראשון ממנו נספרות ההוצאות`,
            BUTTONS: [
                [{ text: "📝 עריכת שם המשפחה", callback_data: "family_editname" }],
                [{ text: "📅 עריכת יום ראשון לחודש", callback_data: "family_setday" }],
                [{ text: "🔙 חזרה לתפריט הראשי", callback_data: "back_to_main_menu" }],
            ],
        },
        CATEGORY: {
            CONTENT: `*תפריט קטגוריות 📚*
ברוכים הבאים הקטגוריות, יש לבחור אופציה מהתפריט: \n
🔸 ➕ הוספת קטגורייה חדשה להוצאות
🔸 💵 הגדרת יעד כספי חודשי לקטגורייה אשר אותו תרצו להוציא בחודש
🔸 📝 שינוי שם קטגורייה (לא ישפיע על הוצאות קודמות)
🔸 ❌ מחיקת קטגוריה`,
            BUTTONS: [
                [{ text: "➕ הוספת קטגורייה", callback_data: "category_add" }],
                [{ text: "📝 עריכת שם קטגורייה", callback_data: "category_rename" }],
                [{ text: "💵 עריכת יעד לקטגורייה", callback_data: "category_set_limit" }],
                [{ text: "❌ מחיקת קטגוריה", callback_data: "category_remove" }],
                [{ text: "🔙 חזרה לתפריט הראשי", callback_data: "back_to_main_menu" }],
            ],
        },
        EXPENSE: {
            CONTENT: `*תפריט הוצאות 💼*\nברוכים הבאים לתפריט הוצאות, יש לבחור אופציה מהתפריט:\n\n🔸🗑️ מחיקת הוצאה קיימת\n🔸✒️ עריכת שם, סכום, וקטגוריית ההוצאה, בנוסף לשינוי תאריך הוצאה חוזרת (בקרוב)`,
            BACK_TO_MENU: "חזרה לתפריט הוצאות 🔙",
            BUTTONS: [
                [
                    { text: "❌ מחיקת הוצאה", callback_data: "expense_delete" },
                    { text: "📝 עריכת הוצאה (בקרוב)", callback_data: "expense_edit" },
                ],
                [{ text: "🔙  חזרה לתפריט הראשי", callback_data: "back_to_main_menu" }],
            ],
        },
        INCOME: {
            CONTENT: `*תפריט הכנסות 💰*\nברוכים הבאים לתפריט הוצאות, יש לבחור אופציה מהתפריט:\n\n🔸🗑️ מחיקת הכנסה קיימת\n🔸✒️ עריכת שם, סכום או תאריך ההכנסה (בקרוב)`,
            BACK_TO_MENU: "חזרה לתפריט הכנסות 🔙",
            BUTTONS: [
                [
                    { text: "❌ מחיקת הכנסה", callback_data: "income_delete" },
                    { text: "📝 (בקרוב) עריכת הכנסה", callback_data: "income_edit" },
                ],
                [{ text: "🔙  חזרה לתפריט הראשי", callback_data: "back_to_main_menu" }],
            ],
        },
        INSIGHTS: {
            CONTENT: `*תפריט סטטיסטיקות 📊*\nתפריט זה יהיה זמין בקרוב.`,
            BUTTONS: [
                [
                    { text: "📊 מאזן הוצאות הכנסות", callback_data: "insights_status" },
                    { text: "⭕ הוצאות לפי קטגורייה", callback_data: "insights_categories" },
                ],
                [
                    { text: "📈 שינוי חודשי", callback_data: "insights_monthly_change" },
                    { text: "📅 היום היקר בשבוע", callback_data: "insights_expensive_day" },
                ],
                [{ text: "🔙  חזרה לתפריט הראשי", callback_data: "back_to_main_menu" }],
            ],
        },
    },
};

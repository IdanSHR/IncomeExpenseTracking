module.exports = {
    GENERAL: {
        CANCEL: "ביטול ❌",
        FINISH: "סיום ✅",
        BACK_TO_MENU: "🔙 חזרה לתפריט הראשי",
        CANCEL_ACTION: "❌ הפעולה בוטלה",
        ERROR_INVALID_NUMBER: "❌ יש להכניס מספר תקני",
        ERROR_INVALID_DATE: "❌ יש להכניס תאריך תקני",
        ERROR_ADMIN: "❌ אינך מנהל",
        CURRENCY: "₪",
        NEXT: "הבא ←",
        PREV: "→ הקודם",
        BOT_COMMANDS: [
            { command: "expense", description: "הוספת הוצאה חדשה 💸" },
            { command: "income", description: "הוספת הכנסה חדשה 💰" },
            { command: "status", description: "סיכום הוצאות הכנסות החודשי 📑" },
            // { command: "categories", description: "חלוקת ההוצאות לפי קטגוריות 🗂" },
            { command: "settings", description: "תפריט הגדרות לעריכת הפרטים ⚙️" },
            { command: "report", description: "דיווח על בעיה או הצעה לשיפור 🐞" },
        ],
    },
    EXPENSE: {
        PROMPT_NAME: "✏️ יש להכניס את שם ההוצאה:",
        PROMPT_CATEGORY: "📚 יש להכניס את קטגוריית ההוצאה:",
        PROMPT_COST: "💰 יש להכניס את עלות ההוצאה:",
        PROMPT_DATE: "📅 יש להכניס את היום בחודש של ההוצאה (1-31):",
        PROMPT_SPLIT: "💰 יש להכניס את מספר התשלומים:",
        SUCCESS_ADDING: "✅ ההוצאה נוספה בהצלחה!",
        SUCCESS_EDITING: "✅ ההוצאה נערכה בהצלחה!",
        SUCCESS_DELETING: "✅ ההוצאה נמחקה בהצלחה",
        SUCCESS_SPLITTING: "✅ ההוצאה פוצלה בהצלחה",
        SUCCESS_ADDING_RECURRING: "✅ הוצאה הפכה לקבועה, כל חודש ב ",
        SUCCESS_RECREATING_EXPENSES: "✅ הוצאות חודשיות נוצרו בהצלחה: \n",
        ERROR_CREATING: "❌ נכשל ביצירת הוצאה",
        ERROR_ADDING: "❌ נכשל בהוספת הוצאה",
        ERROR_EDITING: "❌ נכשל בעריכת הוצאה",
        ERROR_DELETING: "❌ נכשל במחיקת הוצאה",
        ERROR_ADDING_RECURRING: "❌ נכשל בהגדרת הוצאה חוזרת",
        ERROR_SPLITTING: "❌ נכשל בפיצול הוצאה",
        ERROR_NO_EXPENSE: "❌ לא נמצאו הוצאות",
        ERROR_NO_EXPENSES_CATEGORY: "❌ לא נמצאו הוצאות לקטגוריה זו מהזמן האחרון",
        BUTTON_SPLIT: "פיצול הוצאה ✒️",
        BUTTON_RECURRING: "זו הוצאה חודשית 🔁",
        BUTTON_BACK_TO_EDIT: "חזרה לעריכת ההוצאה 🔙",
        BUTTON_EDIT_NAME: "שינוי שם ההוצאה ✏️",
        BUTTON_EDIT_COST: "שינוי סכום ההוצאה 💰",
        BUTTON_EDIT_DATE: "שינוי תאריך ההוצאה 📅",
        BUTTON_EDIT_CATEGORY: "שינוי קטגוריית ההוצאה 📚",
        BUTTON_EDIT_SET_RECURRING: "הגדר כהוצאה חוזרת 🔁",
        BUTTON_EDIT_SET_NOT_RECURRING: "הגדר כהוצאה חד פעמית 🔂",
    },
    INCOME: {
        PROMPT_NAME: "✏️ יש להכניס את שם ההכנסה:",
        PROMPT_AMOUNT: "💰 יש להכניס את סכום ההכנסה:",
        PROMPT_DATE: "📅 יש להכניס את היום בחודש של ההכנסה (1-31):",
        SUCCESS_ADDING: "✅ ההכנסה נוספה בהצלחה!",
        SUCCESS_EDITING: "✅ ההכנסה נערכה בהצלחה!",
        SUCCESS_DELETING: "✅ ההכנסה נמחקה בהצלחה.",
        ERROR_CREATING: "❌ נכשל ביצירת הכנסה",
        ERROR_ADDING: "❌ נכשל בהוספת הכנסה",
        ERROR_EDITING: "❌ נכשל בעריכת הכנסה",
        ERROR_NO_INCOMES: "❌ לא נמצאו הכנסות מהזמן האחרון",
        BUTTON_BACK_TO_EDIT: "חזרה לעריכת הכנסות 🔙",
        BUTTON_EDIT_NAME: "שינוי שם ההכנסה ✏️",
        BUTTON_EDIT_AMOUNT: "שינוי סכום ההכנסה 💰",
        BUTTON_EDIT_DATE: "שינוי תאריך ההכנסה 📅",
    },
    FAMILY: {
        PROMPT_CREATEORJOIN: "👨‍👩‍👧‍👦 האם תרצה ליצור משפחה חדשה או להצטרף למשפחה קיימת?",
        PROMPT_JOIN: "📝 יש להכניס את קוד המשפחה שתרצה להצטרף אליה",
        PROMPT_RENAME: "✒️ מהו שם המשפחה החדש שתרצו?",
        PROMPT_EDIT_DAY: "📅 מהו היום בחודש בו תרצה להתחיל? (1-31)",
        SUCCESS_ADDING: "✅ משפחה נוספה בהצלחה! קוד המשפחה שלך לצירוף בני משפחה הוא:",
        SUCCESS_JOINING: "✅ הצטרפת בהצלחה למשפחת: ",
        SUCCESS_MEMBER_ADDING: "✅ חבר המשפחה נוסף בהצלחה!",
        SUCCESS_MEMBER_REMOVING: "✅ חבר המשפחה הוסר בהצלחה!",
        SUCCESS_RENAME: "✅ שם המשפחה שלך שונה בהצלחה ל-",
        SUCCESS_EDIT_DAY: "✅ הוגדר בהצלחה. מעכשיו הוצאות והכנסות יספרו מה-",
        SUCCESS_EDIT_LIMIT: "✅ הוגדר בהצלחה! היעד החדש של הקטגוריה הוא-",
        ERROR_NOT_FOUND: "❌ לא נמצאה משפחה מקושרת למשתמש",
        ERROR_FOUND: "❌ נמצאה משפחה מקושרת למשתמש",
        ERROR_MEMBER_EXISTS: "❌ הינך כבר חלק מהמשפחה",
        ERROR_WRONG_FAMILY: "❌ משתמש או משפחה לא נכונים",
        ERROR_RENAME: "❌ שגיאה בהגדרת שם המשפחה. יש לנסות שנית.",
        ERROR_EDIT_DAY: "❌ שגיאה בהגדרת היום שבחרת. יש לנסות שנית.",
        ERROR_EDIT_LIMIT: "❌ שגיאה בהגדרת יעד חודשי לקטגוריה. יש לנסות שנית.",
        BUTTON_CREATE: "👪 יצירת משפחה חדשה",
        BUTTON_JOIN: "🔗 הצטרפות למשפחה קיימת",
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
        ERROR_NOT_FOUND: "❌ הקטגורייה המבוקשת לא נמצאה במשפחה",
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
    ADMIN: {
        PROMPT_REPORT: "📝 מה סוג הדיווח שהכי מתאים?",
        PROMPT_DESCRIPTION: "📝 יש לכתוב את התיאור",
        SEND_BUG: "דיווח על בעיה 🐞",
        SEND_SUGGEST: "הצעה לשיפור 📝",
        SUCCESS_REPORT: "✅ הדיווח נשלח בהצלחה",
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
                [
                    { text: "💰 הכנסות", callback_data: "menu_income" },
                    { text: "💼 הוצאות", callback_data: "menu_expense" },
                ],
                [{ text: "📊 סטטיסטיקות (בקרוב)", callback_data: "menu_insights" }],
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
            CONTENT: `*תפריט הוצאות 💼*\nברוכים הבאים לתפריט הוצאות, יש לבחור אופציה מהתפריט:\n\n🔸🗑️ מחיקת הוצאה קיימת\n🔸✒️ עריכת שם, סכום, וקטגוריית ההוצאה, בנוסף לשינוי תאריך הוצאה חוזרת`,
            BACK_TO_MENU: "חזרה לתפריט הוצאות 🔙",
            BUTTONS: [
                [
                    { text: "❌ מחיקת הוצאה", callback_data: "expense_delete" },
                    { text: "📝 עריכת הוצאה", callback_data: "expense_edit" },
                ],
                [{ text: "🔙  חזרה לתפריט הראשי", callback_data: "back_to_main_menu" }],
            ],
        },
        INCOME: {
            CONTENT: `*תפריט הכנסות 💰*\nברוכים הבאים לתפריט הוצאות, יש לבחור אופציה מהתפריט:\n\n🔸🗑️ מחיקת הכנסה קיימת\n🔸✒️ עריכת שם, סכום או תאריך ההכנסה`,
            BACK_TO_MENU: "חזרה לתפריט הכנסות 🔙",
            BUTTONS: [
                [
                    { text: "❌ מחיקת הכנסה", callback_data: "income_delete" },
                    { text: "📝 עריכת הכנסה", callback_data: "income_edit" },
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

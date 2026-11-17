// Every user-facing string in the app, in English and Bengali. Keys are
// plain English phrases so it's obvious what each one is without having to
// cross-reference the components. Supports {placeholder} interpolation.
export const translations = {
  en: {
    // ---- Login ----
    brandName: 'Gas Agency Hisab',
    welcomeBack: 'Welcome back',
    loginSubtitle: 'Sign in as admin or as a delivery partner',
    username: 'Username',
    usernamePlaceholder: 'admin or partner username',
    password: 'Password',
    login: 'Login',
    signingIn: 'Signing in…',
    demoAdminLabel: 'Demo admin:',

    // ---- Shared ----
    logout: 'Logout',
    loading: 'Loading…',
    total: 'Total',
    cylinders: 'cylinders',

    // ---- Partner: page header ----
    dailyHisab: 'Daily Hisab',
    welcomeName: 'Welcome, {name}',
    date: 'Date',

    // ---- Opening stock ----
    openingStockTitle: '🛢️ Opening Stock',
    openingStockSubtitle: 'Cylinders taken out of the godown this morning',
    cylindersTaken: 'Cylinders taken',

    // ---- Deliveries & sales ----
    deliveriesTitle: '📦 Deliveries & Sales',
    deliveriesSubtitle: 'Pick a saved agency below, or type a new name (e.g. a local sale) — same fields either way',
    agencyNamePlaceholder: "Agency name or 'Local Sale'",
    quantityLabel: 'Quantity (cylinders)',
    rateLabel: 'Rate (₹ / cylinder)',
    cashReceivedLabel: 'Cash received (₹)',
    onlineReceivedLabel: 'Online / Phone Pay (₹)',
    shortageLabel: 'Shortage / discount (₹)',
    expected: 'Expected',
    collected: 'Collected',
    due: 'Due',
    addDeliveryRow: '+ Add row (agency, dealer, local sale...)',
    deliveriesHint: "Start typing in <b>Agency name</b> to pick a saved agency (its rate fills in automatically) - or type anything else for a one-off dealer or local sale. <b>Online</b> is a promise that can't be verified on the spot, so it stays part of <b>Due</b> until confirmed. <b>Shortage</b> is a discount nobody will ever pay back, so it is never counted as Due.",

    // ---- Expenses ----
    expensesTitle: '🧾 Expenses',
    expensesSubtitle: 'Diesel, lunch, and other on-the-road costs',
    expensePlaceholder: 'e.g. Diesel',
    addExpense: '+ Add expense',
    noExpensesYet: 'No expenses added yet.',

    // ---- Denominations ----
    denominationTitle: '💵 Cash Denomination Count',
    denominationSubtitle: 'Count every note and coin handed over tonight',
    notes: 'Notes',
    coins: 'Coins',
    countedTotal: 'Counted total',
    balanced: 'Balanced ✓',
    shortBy: 'Short by {amount}',
    excessBy: 'Excess by {amount}',

    // ---- Summary sidebar ----
    todaysSummary: "Today's Summary",
    openingStockRow: 'Opening stock',
    distributed: 'Distributed',
    allAccountedFor: 'All cylinders accounted for ✓',
    cylindersUnaccounted: '{count} cylinders unaccounted',
    extraCylinders: '{count} extra cylinders?',
    totalExpected: 'Total expected',
    cashCollected: 'Cash collected',
    onlineUnverified: 'Online (Phone Pay/UPI) — unverified',
    shortageNotDue: 'Shortage (discount, not due)',
    duePending: 'Due / pending',
    expensesRow: 'Expenses',
    netCashToHandOver: 'Net cash to hand over',

    // ---- Submit ----
    submitHisab: "Submit today's hisab",
    submitting: 'Submitting…',
    savedFor: 'Saved for {date} ✓',
    myPastSubmissions: 'My past submissions',

    // ---- Admin nav ----
    navPartners: 'Delivery Partners',
    navAgencies: 'Agencies',
    navReports: 'Reports',
    adminDashboard: 'Admin Dashboard',
    adminSubtitle: 'Manage delivery partners, agencies, and review daily hisab',

    // ---- Admin: partners ----
    createPartnerTitle: 'Create delivery partner',
    createPartnerHint: 'Give them this username/password - they log into the same app to submit their daily hisab.',
    fullNamePlaceholder: 'Full name',
    usernameMobilePlaceholder: 'Username / mobile',
    passwordPlaceholder: 'Password',
    createPartnerBtn: '+ Create partner',
    creating: 'Creating…',
    allPartnersTitle: 'All delivery partners',
    joined: 'joined {date}',
    noPartnersYet: 'No delivery partners yet — create one above.',

    // ---- Admin: agencies ----
    createAgencyTitle: 'Create agency',
    createAgencyHint: 'A saved agency is a dealer your delivery partners regularly hand cylinders to, at an agreed rate. Once created here, every partner sees it as a pick in their "Deliveries & Sales" form, with the rate filled in automatically — no retyping the name or rate each day.',
    agencyNameFormPlaceholder: 'Agency name (e.g. Shree Balaji Gas Agency)',
    agencyRatePlaceholder: 'Agreed rate per cylinder (e.g. 1100)',
    createAgencyBtn: '+ Create agency',
    allAgenciesTitle: 'All agencies',
    agencyNameCol: 'Name',
    agencyRateCol: 'Default rate / cylinder',
    noAgenciesYet: 'No agencies yet — create one above.',

    // ---- Admin: reports ----
    selectPartnerTitle: 'Select a delivery partner',
    noPartnersShort: 'No delivery partners yet.',
    partnerSubmissionsTitle: "{name}'s submissions",
    noHisabYet: 'No hisab submitted yet.',
    selectPartnerPrompt: 'Select a delivery partner above to see their hisab submissions.',

    // ---- Report (read-only) ----
    hisabFor: 'Hisab for {date}',
    short: 'Short {amount}',
    excess: 'Excess {amount}',
    openingStockColon: 'Opening stock:',
    distributedColon: 'Distributed:',
    allAccountedForShort: 'All accounted for ✓',
    unaccounted: 'unaccounted',
    extra: 'extra',
    reportQty: 'Qty',
    reportRate: 'Rate',
    reportCash: 'Cash',
    reportOnline: 'Online',
    reportShortage: 'Shortage',
    reportDue: 'Due',
    reportTotal: 'Total',
    noneLabel: 'None',
    cashSection: 'Cash',
    onlinePendingUnverified: 'Online pending (unverified):',
    shortageDiscountNotDue: 'Shortage (discount, not due):',
    netCashExpected: 'Net cash expected:',
    countedByPartner: 'Counted by partner:',
    submittedAt: 'Submitted {datetime}',

    // ---- Error messages (mirror the backend's English strings) ----
    errorInvalidCredentials: 'Invalid username or password',
    errorAllFieldsRequired: 'Name, username and password are all required',
    errorUsernameTaken: 'That username is already taken',
    errorAgencyNameRequired: 'Agency name is required',
    errorAgencyExists: 'An agency with that name already exists',
    errorNotAuthenticated: 'Your session has expired - please log in again',
    errorPartnerNotFound: 'Partner not found',
    errorGeneric: 'Something went wrong',
  },

  bn: {
    // ---- Login ----
    brandName: 'গ্যাস এজেন্সি হিসাব',
    welcomeBack: 'আবার স্বাগতম',
    loginSubtitle: 'অ্যাডমিন অথবা ডেলিভারি পার্টনার হিসেবে লগ ইন করুন',
    username: 'ইউজারনেম',
    usernamePlaceholder: 'অ্যাডমিন অথবা পার্টনারের ইউজারনেম',
    password: 'পাসওয়ার্ড',
    login: 'লগ ইন',
    signingIn: 'লগ ইন হচ্ছে…',
    demoAdminLabel: 'ডেমো অ্যাডমিন:',

    // ---- Shared ----
    logout: 'লগ আউট',
    loading: 'লোড হচ্ছে…',
    total: 'মোট',
    cylinders: 'সিলিন্ডার',

    // ---- Partner: page header ----
    dailyHisab: 'দৈনিক হিসাব',
    welcomeName: 'স্বাগতম, {name}',
    date: 'তারিখ',

    // ---- Opening stock ----
    openingStockTitle: '🛢️ প্রাথমিক মজুদ',
    openingStockSubtitle: 'আজ সকালে গোডাউন থেকে বের করা সিলিন্ডার',
    cylindersTaken: 'নেওয়া সিলিন্ডার সংখ্যা',

    // ---- Deliveries & sales ----
    deliveriesTitle: '📦 ডেলিভারি ও বিক্রয়',
    deliveriesSubtitle: 'নিচে থেকে একটি সংরক্ষিত এজেন্সি বেছে নিন, অথবা নতুন নাম লিখুন (যেমন লোকাল সেল) — দুক্ষেত্রেই একই ঘর',
    agencyNamePlaceholder: "এজেন্সির নাম অথবা 'লোকাল সেল'",
    quantityLabel: 'পরিমাণ (সিলিন্ডার)',
    rateLabel: 'রেট (₹ / সিলিন্ডার)',
    cashReceivedLabel: 'নগদ পাওয়া গেছে (₹)',
    onlineReceivedLabel: 'অনলাইন / ফোন পে (₹)',
    shortageLabel: 'ঘাটতি / ছাড় (₹)',
    expected: 'প্রত্যাশিত',
    collected: 'সংগৃহীত',
    due: 'বাকি',
    addDeliveryRow: '+ নতুন সারি যোগ করুন (এজেন্সি, ডিলার, লোকাল সেল...)',
    deliveriesHint: "<b>এজেন্সির নাম</b> ঘরে লেখা শুরু করলে সংরক্ষিত এজেন্সি বেছে নিতে পারবেন (রেট নিজে থেকেই বসে যাবে) - অথবা একবারের কোনো ডিলার বা লোকাল সেলের জন্য অন্য কিছু লিখুন। <b>অনলাইন</b> টাকা হাতে-হাতে যাচাই করা যায় না বলে তা নিশ্চিত না হওয়া পর্যন্ত <b>বাকি</b>-তেই থাকে। <b>ঘাটতি</b> হলো এমন ছাড় যা কেউ কখনো শোধ করবে না, তাই তা কখনোই বাকি হিসেবে গণনা হয় না।",

    // ---- Expenses ----
    expensesTitle: '🧾 খরচ',
    expensesSubtitle: 'ডিজেল, দুপুরের খাবার এবং অন্যান্য পথখরচ',
    expensePlaceholder: 'যেমন: ডিজেল',
    addExpense: '+ খরচ যোগ করুন',
    noExpensesYet: 'এখনো কোনো খরচ যোগ করা হয়নি।',

    // ---- Denominations ----
    denominationTitle: '💵 নগদ টাকার হিসাব (নোট ও কয়েন)',
    denominationSubtitle: 'আজ রাতে জমা দেওয়া প্রতিটি নোট ও কয়েন গণনা করুন',
    notes: 'নোট',
    coins: 'কয়েন',
    countedTotal: 'গণনাকৃত মোট',
    balanced: 'মিলে গেছে ✓',
    shortBy: '{amount} ঘাটতি',
    excessBy: '{amount} বাড়তি',

    // ---- Summary sidebar ----
    todaysSummary: 'আজকের সারসংক্ষেপ',
    openingStockRow: 'প্রাথমিক মজুদ',
    distributed: 'বিতরণ করা হয়েছে',
    allAccountedFor: 'সব সিলিন্ডারের হিসাব মিলেছে ✓',
    cylindersUnaccounted: '{count}টি সিলিন্ডারের হিসাব মিলছে না',
    extraCylinders: '{count}টি অতিরিক্ত সিলিন্ডার?',
    totalExpected: 'মোট প্রত্যাশিত',
    cashCollected: 'নগদ সংগৃহীত',
    onlineUnverified: 'অনলাইন (ফোন পে/UPI) — যাচাই হয়নি',
    shortageNotDue: 'ঘাটতি (ছাড়, বাকি নয়)',
    duePending: 'বাকি / অপেক্ষমাণ',
    expensesRow: 'খরচ',
    netCashToHandOver: 'হস্তান্তরযোগ্য নগদ টাকা',

    // ---- Submit ----
    submitHisab: 'আজকের হিসাব জমা দিন',
    submitting: 'জমা হচ্ছে…',
    savedFor: '{date}-এর জন্য সংরক্ষিত হয়েছে ✓',
    myPastSubmissions: 'আমার আগের জমা হিসাব',

    // ---- Admin nav ----
    navPartners: 'ডেলিভারি পার্টনার',
    navAgencies: 'এজেন্সি',
    navReports: 'রিপোর্ট',
    adminDashboard: 'অ্যাডমিন ড্যাশবোর্ড',
    adminSubtitle: 'ডেলিভারি পার্টনার, এজেন্সি পরিচালনা করুন এবং দৈনিক হিসাব দেখুন',

    // ---- Admin: partners ----
    createPartnerTitle: 'ডেলিভারি পার্টনার তৈরি করুন',
    createPartnerHint: 'তাকে এই ইউজারনেম/পাসওয়ার্ড দিন - সে একই অ্যাপে লগ ইন করে প্রতিদিনের হিসাব জমা দেবে।',
    fullNamePlaceholder: 'পুরো নাম',
    usernameMobilePlaceholder: 'ইউজারনেম / মোবাইল নম্বর',
    passwordPlaceholder: 'পাসওয়ার্ড',
    createPartnerBtn: '+ পার্টনার তৈরি করুন',
    creating: 'তৈরি হচ্ছে…',
    allPartnersTitle: 'সব ডেলিভারি পার্টনার',
    joined: '{date}-এ যোগদান',
    noPartnersYet: 'এখনো কোনো ডেলিভারি পার্টনার নেই — উপরে একজনকে তৈরি করুন।',

    // ---- Admin: agencies ----
    createAgencyTitle: 'এজেন্সি তৈরি করুন',
    createAgencyHint: 'সংরক্ষিত এজেন্সি হলো এমন একজন ডিলার, যাকে আপনার ডেলিভারি পার্টনাররা নিয়মিত নির্ধারিত রেটে সিলিন্ডার দিয়ে থাকে। এখানে একবার তৈরি করলে প্রতিটি পার্টনার তাদের "ডেলিভারি ও বিক্রয়" ফর্মে এটি বেছে নিতে পারবে এবং রেট নিজে থেকেই বসে যাবে — প্রতিদিন নাম বা রেট আর নতুন করে লিখতে হবে না।',
    agencyNameFormPlaceholder: 'এজেন্সির নাম (যেমন: শ্রী বালাজী গ্যাস এজেন্সি)',
    agencyRatePlaceholder: 'প্রতি সিলিন্ডারে নির্ধারিত রেট (যেমন: ১১০০)',
    createAgencyBtn: '+ এজেন্সি তৈরি করুন',
    allAgenciesTitle: 'সব এজেন্সি',
    agencyNameCol: 'নাম',
    agencyRateCol: 'ডিফল্ট রেট / সিলিন্ডার',
    noAgenciesYet: 'এখনো কোনো এজেন্সি নেই — উপরে একটি তৈরি করুন।',

    // ---- Admin: reports ----
    selectPartnerTitle: 'একজন ডেলিভারি পার্টনার নির্বাচন করুন',
    noPartnersShort: 'এখনো কোনো ডেলিভারি পার্টনার নেই।',
    partnerSubmissionsTitle: '{name}-এর জমা হিসাব',
    noHisabYet: 'এখনো কোনো হিসাব জমা দেওয়া হয়নি।',
    selectPartnerPrompt: 'হিসাব দেখতে উপরে থেকে একজন ডেলিভারি পার্টনার নির্বাচন করুন।',

    // ---- Report (read-only) ----
    hisabFor: '{date}-এর হিসাব',
    short: '{amount} ঘাটতি',
    excess: '{amount} বাড়তি',
    openingStockColon: 'প্রাথমিক মজুদ:',
    distributedColon: 'বিতরণ:',
    allAccountedForShort: 'সব হিসাব মিলেছে ✓',
    unaccounted: 'হিসাব মিলছে না',
    extra: 'অতিরিক্ত',
    reportQty: 'পরিমাণ',
    reportRate: 'রেট',
    reportCash: 'নগদ',
    reportOnline: 'অনলাইন',
    reportShortage: 'ঘাটতি',
    reportDue: 'বাকি',
    reportTotal: 'মোট',
    noneLabel: 'নেই',
    cashSection: 'নগদ',
    onlinePendingUnverified: 'অনলাইন অপেক্ষমাণ (যাচাই হয়নি):',
    shortageDiscountNotDue: 'ঘাটতি (ছাড়, বাকি নয়):',
    netCashExpected: 'প্রত্যাশিত নগদ টাকা:',
    countedByPartner: 'পার্টনারের গণনা:',
    submittedAt: '{datetime}-এ জমা দেওয়া হয়েছে',

    // ---- Error messages (mirror the backend's English strings) ----
    errorInvalidCredentials: 'ইউজারনেম অথবা পাসওয়ার্ড ভুল',
    errorAllFieldsRequired: 'নাম, ইউজারনেম এবং পাসওয়ার্ড সবগুলো দিতে হবে',
    errorUsernameTaken: 'এই ইউজারনেমটি আগে থেকেই ব্যবহার হয়ে গেছে',
    errorAgencyNameRequired: 'এজেন্সির নাম দিতে হবে',
    errorAgencyExists: 'এই নামে একটি এজেন্সি আগে থেকেই আছে',
    errorNotAuthenticated: 'আপনার সেশনের মেয়াদ শেষ হয়ে গেছে - আবার লগ ইন করুন',
    errorPartnerNotFound: 'পার্টনার খুঁজে পাওয়া যায়নি',
    errorGeneric: 'কিছু একটা সমস্যা হয়েছে',
  },
};

// The backend always replies in English (it has no concept of the viewer's
// language) - map its known error strings to a translation key so the
// message still shows up in whichever language is selected. An error the
// backend didn't send on purpose (a network failure, an unexpected 500)
// falls through to the generic message instead of leaking a raw string.
const BACKEND_ERROR_KEYS = {
  'Invalid username or password': 'errorInvalidCredentials',
  'Name, username and password are all required': 'errorAllFieldsRequired',
  'That username is already taken': 'errorUsernameTaken',
  'Agency name is required': 'errorAgencyNameRequired',
  'An agency with that name already exists': 'errorAgencyExists',
  'Not authenticated': 'errorNotAuthenticated',
  'Partner not found': 'errorPartnerNotFound',
};

export function translateError(message, t) {
  const key = BACKEND_ERROR_KEYS[message];
  return key ? t(key) : message || t('errorGeneric');
}

export function createTranslator(language) {
  return function t(key, params) {
    let str = translations[language]?.[key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        str = str.replace(`{${paramKey}}`, value);
      }
    }
    return str;
  };
}

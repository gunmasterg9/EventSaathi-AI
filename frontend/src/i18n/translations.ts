import { Language } from '../types';

export interface TranslationDict {
  brandName: string;
  brandTagline: string;
  taglineSub: string;
  heroCTA: string;
  demoEventCTA: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;

  // Nav
  navDashboard: string;
  navPlan: string;
  navBudget: string;
  navTimeline: string;
  navVendors: string;
  navEvents: string;
  navNewEvent: string;
  navSettings: string;

  // Wizard
  wizardTitle: string;
  wizardSubtitle: string;
  stepBasics: string;
  stepBudgetGuests: string;
  stepPreferences: string;
  eventNameLabel: string;
  eventNamePlaceholder: string;
  eventTypeLabel: string;
  eventDateLabel: string;
  eventDatePlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  venueStatusLabel: string;
  venueNotBooked: string;
  venueShortlisted: string;
  venueBooked: string;
  guestCountLabel: string;
  budgetLabel: string;
  currencyLabel: string;
  languageLabel: string;
  themeLabel: string;
  themePlaceholder: string;
  dietaryLabel: string;
  dietaryPlaceholder: string;
  indoorOutdoorLabel: string;
  optIndoor: string;
  optOutdoor: string;
  optBoth: string;
  optFlexible: string;
  notesLabel: string;
  notesPlaceholder: string;
  btnCreateAndGenerate: string;
  btnCreating: string;
  back: string;
  next: string;

  // Event types
  typeWedding: string;
  typeBirthday: string;
  typeCommunity: string;
  typeOther: string;

  // Dashboard
  dashboardOverview: string;
  statTotalBudget: string;
  statSpent: string;
  statRemaining: string;
  statTasksProgress: string;
  statVendorsBooked: string;
  quickActions: string;
  viewMasterPlan: string;
  manageBudget: string;
  trackTasks: string;
  coordinateVendors: string;
  regeneratePlanBtn: string;
  regenerating: string;
  aiBadge: string;
  fallbackBadge: string;
  fallbackNote: string;
  budgetAlertOver: string;
  budgetAlertGood: string;

  // Plan Viewer
  planTitle: string;
  conceptThemeTitle: string;
  scheduleTitle: string;
  guestIdeasTitle: string;
  contingenciesTitle: string;
  prepStepsTitle: string;
  noPlanYet: string;
  generatePlanPrompt: string;

  // Budget
  budgetTitle: string;
  budgetSubtitle: string;
  addExpenseBtn: string;
  exportCsvBtn: string;
  thCategory: string;
  thItem: string;
  thEstimated: string;
  thActual: string;
  thVariance: string;
  thPaid: string;
  thActions: string;
  paidYes: string;
  paidNo: string;
  categoryBreakdown: string;
  overBudgetWarning: string;

  // Timeline
  timelineTitle: string;
  timelineSubtitle: string;
  addTaskBtn: string;
  filterAll: string;
  filterPending: string;
  filterCompleted: string;
  filterPriorityAll: string;
  filterHigh: string;
  filterMedium: string;
  filterLow: string;
  markDone: string;
  markPending: string;
  dueBy: string;

  // Vendors
  vendorsTitle: string;
  vendorsSubtitle: string;
  addVendorBtn: string;
  statusNotContacted: string;
  statusContacted: string;
  statusQuoted: string;
  statusBooked: string;
  statusRejected: string;
  contactPerson: string;
  phone: string;
  email: string;
  quoteEstimated: string;
  quoteFinal: string;
  criteriaLabel: string;

  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  confirmDelete: string;
  loading: string;
  error: string;
  success: string;
  close: string;
  selectLanguage: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    brandName: "EventSaathi AI",
    brandTagline: "GenAI Celebration & Event Planner",
    taglineSub: "Plan memorable weddings, birthdays, and community festivals within your budget, with zero stress and precision guidance.",
    heroCTA: "Create New Celebration",
    demoEventCTA: "Load Sample Celebration (Ahmedabad Birthday)",
    feature1Title: "Culturally Aware AI Planning",
    feature1Desc: "Customized traditions, schedules, and decor concepts in English, Hindi, and Gujarati.",
    feature2Title: "Zero-Surprise Budget Intelligence",
    feature2Desc: "Real-time estimated vs actual tracking, percentage breakdowns, and CSV export.",
    feature3Title: "Interactive Timeline & Tasks",
    feature3Desc: "Step-by-step milestones with due dates, priority alerts, and instant progress tracking.",
    feature4Title: "Transparent Vendor Workspace",
    feature4Desc: "Compare quotes, manage contacts, track booking statuses, and evaluate checklists.",

    navDashboard: "Dashboard",
    navPlan: "Master Plan",
    navBudget: "Budget Planner",
    navTimeline: "Timeline & Tasks",
    navVendors: "Vendor Hub",
    navEvents: "Saved Events",
    navNewEvent: "+ Plan Event",
    navSettings: "Settings & AI Status",

    wizardTitle: "Celebration Planning Wizard",
    wizardSubtitle: "Tell us about your celebration to generate a personalized master plan and budget breakdown.",
    stepBasics: "1. Event Basics",
    stepBudgetGuests: "2. Budget & Guests",
    stepPreferences: "3. Style & Culture",
    eventNameLabel: "Event Name",
    eventNamePlaceholder: "e.g., Ananya's 1st Birthday / Priya & Rohan Wedding",
    eventTypeLabel: "Event Type",
    eventDateLabel: "Event Date (Optional)",
    eventDatePlaceholder: "Select date if decided",
    cityLabel: "City / Location",
    cityPlaceholder: "e.g., Ahmedabad, Surat, Mumbai",
    venueStatusLabel: "Venue Status",
    venueNotBooked: "Not yet booked",
    venueShortlisted: "Shortlisted candidates",
    venueBooked: "Venue already confirmed",
    guestCountLabel: "Expected Guests",
    budgetLabel: "Total Budget",
    currencyLabel: "Currency",
    languageLabel: "Planning Language",
    themeLabel: "Theme or Aesthetic Style (Optional)",
    themePlaceholder: "e.g., Royal Traditional, Floral Pastel, Bollywood Retro",
    dietaryLabel: "Dietary & Accessibility Requirements (Optional)",
    dietaryPlaceholder: "e.g., Pure Veg Jain counter, wheelchair ramp access",
    indoorOutdoorLabel: "Setting Preference",
    optIndoor: "Indoor Banquet / Hall",
    optOutdoor: "Outdoor Lawn / Ground",
    optBoth: "Both Indoor & Outdoor",
    optFlexible: "Flexible / No Preference",
    notesLabel: "Special Traditions or Additional Notes (Optional)",
    notesPlaceholder: "e.g., Include live Garba, photo booth props, return gift favors",
    btnCreateAndGenerate: "Generate Celebration Master Plan ✨",
    btnCreating: "Synthesizing AI Plan...",
    back: "Back",
    next: "Next",

    typeWedding: "Wedding Ceremony",
    typeBirthday: "Birthday Celebration",
    typeCommunity: "Community / Festive Utsav",
    typeOther: "Other Celebration",

    dashboardOverview: "Event Overview",
    statTotalBudget: "Total Budget",
    statSpent: "Actual Spent",
    statRemaining: "Remaining Budget",
    statTasksProgress: "Tasks Completed",
    statVendorsBooked: "Vendors Booked",
    quickActions: "Quick Workspaces",
    viewMasterPlan: "View AI Master Plan",
    manageBudget: "Open Budget Intelligence",
    trackTasks: "Timeline & Checklist",
    coordinateVendors: "Vendor Coordination",
    regeneratePlanBtn: "Regenerate AI Plan",
    regenerating: "Synthesizing Plan...",
    aiBadge: "AI Engine: Gemini 3.5 Flash",
    fallbackBadge: "Local Planning Engine (Reliable Fallback)",
    fallbackNote: "Generated via our deterministic celebration planner. All cost allocations and milestones are tailored to your event inputs.",
    budgetAlertOver: "Warning: Expenses exceed budget by",
    budgetAlertGood: "Budget health is excellent. You are within your target allocation.",

    planTitle: "AI-Generated Celebration Master Plan",
    conceptThemeTitle: "Theme Concept & Creative Direction",
    scheduleTitle: "Event-Day Schedule & Itinerary",
    guestIdeasTitle: "Memorable Guest Experience Ideas",
    contingenciesTitle: "Contingency & Weather Plans",
    prepStepsTitle: "Key Preparation Milestones",
    noPlanYet: "No plan generated yet.",
    generatePlanPrompt: "Click Generate Plan to synthesize personalized schedules, budget splits, and vendor checklists.",

    budgetTitle: "Budget Intelligence & Cost Breakdown",
    budgetSubtitle: "Transparent decimal-safe cost management with estimated vs actual tracking.",
    addExpenseBtn: "+ Add Expense Item",
    exportCsvBtn: "Export to CSV",
    thCategory: "Category",
    thItem: "Expense Item",
    thEstimated: "Estimated",
    thActual: "Actual Spent",
    thVariance: "Variance",
    thPaid: "Paid?",
    thActions: "Actions",
    paidYes: "Paid",
    paidNo: "Pending",
    categoryBreakdown: "Category Allocation Breakdown",
    overBudgetWarning: "Over-Budget Warning: Review expenses to avoid unexpected costs.",

    timelineTitle: "Interactive Timeline & Checklist",
    timelineSubtitle: "Track crucial preparation steps from booking to the celebration day.",
    addTaskBtn: "+ Add Task",
    filterAll: "All Tasks",
    filterPending: "Pending",
    filterCompleted: "Completed",
    filterPriorityAll: "All Priorities",
    filterHigh: "High Priority",
    filterMedium: "Medium Priority",
    filterLow: "Low Priority",
    markDone: "Mark Done",
    markPending: "Reopen",
    dueBy: "Due / Milestone:",

    vendorsTitle: "Vendor Planning & Comparison Hub",
    vendorsSubtitle: "Coordinate service quotes, compare criteria, and track booking statuses.",
    addVendorBtn: "+ Add Vendor",
    statusNotContacted: "Not Contacted",
    statusContacted: "Contacted",
    statusQuoted: "Quote Received",
    statusBooked: "Confirmed / Booked",
    statusRejected: "Declined",
    contactPerson: "Contact Person",
    phone: "Phone / WhatsApp",
    email: "Email",
    quoteEstimated: "Est. Quote",
    quoteFinal: "Final Quote",
    criteriaLabel: "Selection Criteria / Checklist",

    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirmDelete: "Are you sure you want to delete this?",
    loading: "Loading...",
    error: "An error occurred. Please try again.",
    success: "Success!",
    close: "Close",
    selectLanguage: "Language"
  },

  hi: {
    brandName: "इवेंटसाथी AI",
    brandTagline: "GenAI उत्सव और आयोजन योजनाकार",
    taglineSub: "विवाह, जन्मदिन और सामुदायिक उत्सवों को अपने बजट में बिना किसी तनाव और सटीक मार्गदर्शन के साथ प्लान करें।",
    heroCTA: "नया आयोजन शुरू करें",
    demoEventCTA: "नमूना उत्सव लोड करें (अहमदाबाद जन्मदिन)",
    feature1Title: "सांस्कृतिक रूप से सजग AI योजना",
    feature1Desc: "अंग्रेजी, हिंदी और गुजराती में अनुकूलित परंपराएं, समय-सारणी और सजावट संकल्पनाएं।",
    feature2Title: "पारदर्शी बजट इंटेलिजेंस",
    feature2Desc: "वास्तविक समय में अनुमानित बनाम वास्तविक लागत, प्रतिशत वितरण और सुरक्षित CSV निर्यात।",
    feature3Title: "इंटरएक्टिव समय-सीमा व कार्य-सूची",
    feature3Desc: "नियत तिथियों, प्राथमिकता चेतावनी और त्वरित प्रगति ट्रैकिंग के साथ चरणबद्ध मील के पत्थर।",
    feature4Title: "सुलभ वेंडर प्रबंधन केंद्र",
    feature4Desc: "कोटेशन की तुलना करें, संपर्कों का प्रबंधन करें, बुकिंग स्थिति और चेकलिस्ट जांचें।",

    navDashboard: "डैशबोर्ड",
    navPlan: "मास्टर प्लान",
    navBudget: "बजट योजनाकार",
    navTimeline: "समय-सारणी व कार्य",
    navVendors: "वेंडर हब",
    navEvents: "सहेजे गए आयोजन",
    navNewEvent: "+ नया आयोजन",
    navSettings: "सेटिंग्स व AI स्थिति",

    wizardTitle: "उत्सव योजना विज़ार्ड",
    wizardSubtitle: "व्यक्तिगत मास्टर प्लान और बजट विभाजन तैयार करने के लिए अपने उत्सव की जानकारी साझा करें।",
    stepBasics: "1. बुनियादी जानकारी",
    stepBudgetGuests: "2. बजट और अतिथि",
    stepPreferences: "3. शैली और परंपरा",
    eventNameLabel: "आयोजन का नाम",
    eventNamePlaceholder: "उदा., अनन्या का पहला जन्मदिन / प्रिया और रोहन विवाह",
    eventTypeLabel: "आयोजन का प्रकार",
    eventDateLabel: "आयोजन की तारीख (वैकल्पिक)",
    eventDatePlaceholder: "यदि तय हो तो तारीख चुनें",
    cityLabel: "शहर / स्थान",
    cityPlaceholder: "उदा., अहमदाबाद, सूरत, मुंबई",
    venueStatusLabel: "स्थान (Venue) की स्थिति",
    venueNotBooked: "अभी बुक नहीं किया",
    venueShortlisted: "चयन प्रक्रिया में है",
    venueBooked: "स्थान पहले से बुक है",
    guestCountLabel: "अतिथियों की संख्या",
    budgetLabel: "कुल बजट",
    currencyLabel: "मुद्रा",
    languageLabel: "आयोजन की भाषा",
    themeLabel: "थीम या सजावट शैली (वैकल्पिक)",
    themePlaceholder: "उदा., शाही पारंपरिक, फ्लोरल पेस्टल, बॉलीवुड रेट्रो",
    dietaryLabel: "खान-पान और पहुंच आवश्यकताएं (वैकल्पिक)",
    dietaryPlaceholder: "उदा., शुद्ध शाकाहारी जैन काउंटर, व्हीलचेयर रैंप",
    indoorOutdoorLabel: "स्थान वरीयता",
    optIndoor: "इनडोर हॉल / बैंक्वेट",
    optOutdoor: "आउटडोर लॉन / मैदान",
    optBoth: "इनडोर और आउटडोर दोनों",
    optFlexible: "लचीला / कोई वरीयता नहीं",
    notesLabel: "विशेष परंपराएं या अतिरिक्त टिप्पणियां",
    notesPlaceholder: "उदा., गरबा व्यवस्था, फोटो बूथ प्रॉप्स, रिटर्न गिफ्ट्स",
    btnCreateAndGenerate: "उत्सव मास्टर प्लान तैयार करें ✨",
    btnCreating: "योजना तैयार हो रही है...",
    back: "पीछे",
    next: "आगे",

    typeWedding: "विवाह समारोह (Wedding)",
    typeBirthday: "जन्मदिन उत्सव (Birthday)",
    typeCommunity: "सामुदायिक / धार्मिक उत्सव (Community)",
    typeOther: "अन्य उत्सव (Other Celebration)",

    dashboardOverview: "आयोजन अवलोकन",
    statTotalBudget: "कुल बजट",
    statSpent: "वास्तविक खर्च",
    statRemaining: "शेष बजट",
    statTasksProgress: "पूर्ण कार्य",
    statVendorsBooked: "बुक किए गए वेंडर",
    quickActions: "त्वरित अनुभाग",
    viewMasterPlan: "मास्टर प्लान देखें",
    manageBudget: "बजट प्रबंधन खोलें",
    trackTasks: "समय-सारणी और चेकलिस्ट",
    coordinateVendors: "वेंडर समन्वय",
    regeneratePlanBtn: "नया प्लान बनाएं",
    regenerating: "योजना तैयार हो रही है...",
    aiBadge: "AI इंजन: Gemini 3.5 Flash",
    fallbackBadge: "स्थानीय योजना इंजन (सुरक्षित फॉलबैक)",
    fallbackNote: "हमारे नियम-आधारित उत्सव योजनाकार द्वारा तैयार किया गया। सभी आवंटन आपके इनपुट के अनुकूल हैं।",
    budgetAlertOver: "चेतावनी: खर्च निर्धारित बजट से अधिक है:",
    budgetAlertGood: "बजट स्थिति उत्कृष्ट है। आप अपने लक्ष्य के भीतर हैं।",

    planTitle: "AI-जनित उत्सव मास्टर प्लान",
    conceptThemeTitle: "थीम संकल्पना और रचनात्मक दिशा",
    scheduleTitle: "आयोजन दिवस की समय-सारणी",
    guestIdeasTitle: "अतिथि अनुभव और सत्कार विचार",
    contingenciesTitle: "आकस्मिक और मौसम योजना",
    prepStepsTitle: "मुख्य तैयारी के चरण",
    noPlanYet: "अभी तक कोई योजना तैयार नहीं है।",
    generatePlanPrompt: "व्यक्तिगत योजना, बजट और चेकलिस्ट के लिए प्लान जनरेट करें।",

    budgetTitle: "बजट इंटेलिजेंस और लागत विवरण",
    budgetSubtitle: "अनुमानित बनाम वास्तविक ट्रैकिंग के साथ पारदर्शी वित्तीय प्रबंधन।",
    addExpenseBtn: "+ नया खर्च जोड़ें",
    exportCsvBtn: "CSV निर्यात करें",
    thCategory: "श्रेणी (Category)",
    thItem: "मद का नाम (Item)",
    thEstimated: "अनुमानित लागत",
    thActual: "वास्तविक खर्च",
    thVariance: "अंतर (Variance)",
    thPaid: "भुगतान स्थिति",
    thActions: "क्रियाएं",
    paidYes: "भुगतान पूर्ण",
    paidNo: "लंबित",
    categoryBreakdown: "श्रेणीवार बजट विभाजन",
    overBudgetWarning: "बजट से अधिक खर्च चेतावनी: अनावश्यक खर्चों की समीक्षा करें।",

    timelineTitle: "इंटरएक्टिव समय-सीमा व कार्य-सूची",
    timelineSubtitle: "बुकिंग से लेकर आयोजन दिवस तक के सभी आवश्यक कदमों को ट्रैक करें।",
    addTaskBtn: "+ कार्य जोड़ें",
    filterAll: "सभी कार्य",
    filterPending: "लंबित",
    filterCompleted: "पूर्ण",
    filterPriorityAll: "सभी प्राथमिकताएं",
    filterHigh: "उच्च प्राथमिकता",
    filterMedium: "मध्यम प्राथमिकता",
    filterLow: "सामान्य प्राथमिकता",
    markDone: "पूर्ण चिह्नित करें",
    markPending: "पुनः खोलें",
    dueBy: "नियत समय:",

    vendorsTitle: "वेंडर योजना व तुलना केंद्र",
    vendorsSubtitle: "कोटेशन की तुलना करें, संपर्कों को प्रबंधित करें और बुकिंग ट्रैक करें।",
    addVendorBtn: "+ वेंडर जोड़ें",
    statusNotContacted: "संपर्क नहीं किया",
    statusContacted: "संपर्क किया गया",
    statusQuoted: "कोटेशन प्राप्त",
    statusBooked: "बुक / पुष्टि पूर्ण",
    statusRejected: "अस्वीकृत",
    contactPerson: "संपर्क व्यक्ति",
    phone: "फोन / व्हाट्सएप",
    email: "ईमेल",
    quoteEstimated: "अनुमानित कोट",
    quoteFinal: "अंतिम कोट",
    criteriaLabel: "चयन मानदंड / आवश्यकताएं",

    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संशोधित करें",
    confirmDelete: "क्या आप वाकई इसे हटाना चाहते हैं?",
    loading: "लोड हो रहा है...",
    error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    success: "सफल!",
    close: "बंद करें",
    selectLanguage: "भाषा"
  },

  gu: {
    brandName: "ઈવેન્ટસાથી AI",
    brandTagline: "GenAI ઉત્સવ અને પ્રસંગ આયોજક",
    taglineSub: "લગ્નપ્રસંગ, જન્મદિવસ અને સામાજિક ઉત્સવો તમારા બજેટમાં ચિંતામુક્ત અને ચોક્કસ માર્ગદર્શન સાથે આયોજિત કરો.",
    heroCTA: "નવો પ્રસંગ પ્લાન કરો",
    demoEventCTA: "નમૂનાનો ઉત્સવ લોડ કરો (અમદાવાદ બર્થડે)",
    feature1Title: "સાંસ્કૃતિક રીતે સભાન AI આયોજન",
    feature1Desc: "ગુજરાતી, હિન્દી અને અંગ્રેજીમાં પરંપરાગત રીત-રિવાજ, સમયપત્રક અને ડેકોરેશન કોન્સેપ્ટ.",
    feature2Title: "પારદર્શક બજેટ ઇન્ટેલિજન્સ",
    feature2Desc: "અંદાજિત વિરુદ્ધ વાસ્તવિક ખર્ચનું રીઅલ-ટાઇમ ટ્રેકિંગ, ટકાવારી વિશ્લેષણ અને CSV એક્સપોર્ટ.",
    feature3Title: "ઇન્ટરેક્ટિવ સમયપત્રક અને કાર્યો",
    feature3Desc: "ચોક્કસ મુદત, પ્રાથમિકતા ચેતવણી અને ત્વરિત પ્રગતિ ટ્રેકિંગ સાથેના તબક્કાવાર પગલાં.",
    feature4Title: "સુલભ વેન્ડર સંચાલન કેન્દ્ર",
    feature4Desc: "ભાવની સરખામણી કરો, સંપર્કો સાચવો અને બુકિંગ સ્ટેટસનું સરળ સંચાલન કરો.",

    navDashboard: "ડેશબોર્ડ",
    navPlan: "મુખ્ય પ્લાન",
    navBudget: "બજેટ પ્લાનર",
    navTimeline: "સમયપત્રક અને કાર્યો",
    navVendors: "વેન્ડર હબ",
    navEvents: "સાચવેલા પ્રસંગો",
    navNewEvent: "+ નવો પ્રસંગ",
    navSettings: "સેટિંગ્સ અને AI સ્થિતિ",

    wizardTitle: "ઉત્સવ આયોજન વિઝાર્ડ",
    wizardSubtitle: "તમારા પ્રસંગ માટે વ્યક્તિગત પ્લાન અને બજેટ બનાવવા વિગતો દાખલ કરો.",
    stepBasics: "૧. મૂળભૂત વિગત",
    stepBudgetGuests: "૨. બજેટ અને મહેમાનો",
    stepPreferences: "૩. શૈલી અને સંસ્કૃતિ",
    eventNameLabel: "પ્રસંગનું નામ",
    eventNamePlaceholder: "દા.ત., અનન્યાનો ૧લો જન્મદિવસ / પ્રિયા અને રોહનનો લગ્નોત્સવ",
    eventTypeLabel: "પ્રસંગનો પ્રકાર",
    eventDateLabel: "પ્રસંગની તારીખ (વૈકલ્પિક)",
    eventDatePlaceholder: "જો નક્કી હોય તો તારીખ પસંદ કરો",
    cityLabel: "શહેર / સ્થળ",
    cityPlaceholder: "દા.ત., અમદાવાદ, સુરત, વડોદરા",
    venueStatusLabel: "સ્થળ / વાડીની સ્થિતિ",
    venueNotBooked: "હજુ નક્કી નથી કર્યું",
    venueShortlisted: "પસંદગી પ્રક્રિયા ચાલુ છે",
    venueBooked: "સ્થળ બુક થઈ ગયું છે",
    guestCountLabel: "અંદાજિત મહેમાનો",
    budgetLabel: "કુલ બજેટ",
    currencyLabel: "ચલણ",
    languageLabel: "આયોજનની ભાષા",
    themeLabel: "થીમ અથવા ડેકોરેશન શૈલી (વૈકલ્પિક)",
    themePlaceholder: "દા.ત., રાજવી પરંપરાગત, ફ્લોરલ પેસ્ટલ, ગરબા નાઈટ",
    dietaryLabel: "ભોજન અને અન્ય જરૂરિયાતો (વૈકલ્પિક)",
    dietaryPlaceholder: "દા.ત., શુદ્ધ શાકાહારી/જૈન મેનુ, વ્હીલચેર સુવિધા",
    indoorOutdoorLabel: "સ્થળની પસંદગી",
    optIndoor: "ઇન્ડોર પાર્ટી હોલ / વાડી",
    optOutdoor: "ઓપન પાર્ટી પ્લોટ / લોન",
    optBoth: "ઇન્ડોર અને આઉટડોર બંને",
    optFlexible: "ગમે તે / કોઈ ચોક્કસ પસંદગી નથી",
    notesLabel: "વિશેષ પરંપરા કે વધારાની નોંધ",
    notesPlaceholder: "દા.ત., લાઈવ ગરબા, સેલ્ફી બૂથ, રિટર્ન ગિફ્ટ્સ",
    btnCreateAndGenerate: "ઉત્સવનો મુખ્ય પ્લાન બનાવો ✨",
    btnCreating: "પ્લાન તૈયાર થઈ રહ્યો છે...",
    back: "પાછળ",
    next: "આગળ",

    typeWedding: "લગ્નપ્રસંગ (Wedding)",
    typeBirthday: "જન્મદિવસ ઉજવણી (Birthday)",
    typeCommunity: "સામાજિક ઉત્સવ (Community Event)",
    typeOther: "અન્ય પ્રસંગ (Other Celebration)",

    dashboardOverview: "પ્રસંગ પરિચય",
    statTotalBudget: "કુલ બજેટ",
    statSpent: "થયેલો ખર્ચ",
    statRemaining: "બાકી બજેટ",
    statTasksProgress: "પૂર્ણ કાર્યો",
    statVendorsBooked: "બુક થયેલ વેન્ડર્સ",
    quickActions: "ઝડપી કાર્યો",
    viewMasterPlan: "માસ્ટર પ્લાન જુઓ",
    manageBudget: "બજેટ મેનેજર ખોલો",
    trackTasks: "સમયપત્રક અને ચેકલિસ્ટ",
    coordinateVendors: "વેન્ડર વ્યવસ્થા",
    regeneratePlanBtn: "નવો પ્લાન બનાવો",
    regenerating: "પ્લાન બની રહ્યો છે...",
    aiBadge: "AI એન્જિન: Gemini 3.5 Flash",
    fallbackBadge: "સ્થાનિક આયોજન એન્જિન (વિશ્વસનીય ફોલબેક)",
    fallbackNote: "અમારા સ્થાનિક આયોજન એન્જિન દ્વારા તૈયાર કરાયેલ. તમામ ખર્ચાળ ફાળવણી તમારા ઇનપુટ મુજબ છે.",
    budgetAlertOver: "ચેતવણી: ખર્ચ બજેટ કરતાં વધી ગયો છે:",
    budgetAlertGood: "બજેટ વ્યવસ્થા ઉત્તમ છે. ખર્ચ મર્યાદામાં છે.",

    planTitle: "AI દ્વારા તૈયાર કરાયેલ મુખ્ય ઉત્સવ પ્લાન",
    conceptThemeTitle: "થીમ કોન્સેપ્ટ અને રચનાત્મક શૈલી",
    scheduleTitle: "પ્રસંગ દિવસનું સમયપત્રક",
    guestIdeasTitle: "મહેમાનોના સત્કાર અને મનોરંજન આઈડિયા",
    contingenciesTitle: "આકસ્મિક અને વાતાવરણ આયોજન",
    prepStepsTitle: "તૈયારીના મહત્વપૂર્ણ પગલાં",
    noPlanYet: "હજુ કોઈ પ્લાન બન્યો નથી.",
    generatePlanPrompt: "સંપૂર્ણ ટાઈમલાઈન અને બજેટ માટે પ્લાન જનરેટ બટન દબાવો.",

    budgetTitle: "બજેટ ઇન્ટેલિજન્સ અને ખર્ચ વિશ્લેષણ",
    budgetSubtitle: "અંદાજિત વિરુદ્ધ વાસ્તવિક ખર્ચ ટ્રેકિંગ સાથે પારદર્શક નાણાકીય આયોજન.",
    addExpenseBtn: "+ નવો ખર્ચ ઉમેરો",
    exportCsvBtn: "CSV ડાઉનલોડ કરો",
    thCategory: "શ્રેણી (Category)",
    thItem: "ખર્ચની વિગત (Item)",
    thEstimated: "અંદાજિત ખર્ચ",
    thActual: "થયેલ ખર્ચ",
    thVariance: "તફાવત (Variance)",
    thPaid: "ચૂકવણી સ્થિતિ",
    thActions: "ક્રિયાઓ",
    paidYes: "ચુકવાઈ ગયું",
    paidNo: "બાકી",
    categoryBreakdown: "શ્રેણીવાર બજેટ ફાળવણી",
    overBudgetWarning: "બજેટ બહાર ખર્ચ ચેતવણી: બિનજરૂરી ખર્ચાઓ પર નિયંત્રણ રાખો.",

    timelineTitle: "ઇન્ટરેક્ટિવ સમયપત્રક અને ચેકલિસ્ટ",
    timelineSubtitle: "બુકિંગથી લઈને ઉત્સવના દિવસ સુધીના તમામ પગલાં ટ્રેક કરો.",
    addTaskBtn: "+ કાર્ય ઉમેરો",
    filterAll: "બધા કાર્યો",
    filterPending: "બાકી કાર્યો",
    filterCompleted: "પૂર્ણ થયેલા",
    filterPriorityAll: "તમામ પ્રાથમિકતાઓ",
    filterHigh: "ઉચ્ચ પ્રાથમિકતા",
    filterMedium: "મધ્યમ પ્રાથમિકતા",
    filterLow: "સામાન્ય પ્રાથમિકતા",
    markDone: "પૂર્ણ કરો",
    markPending: "ફરી ખોલો",
    dueBy: "સમયમર્યાદા:",

    vendorsTitle: "વેન્ડર વ્યવસ્થા અને સરખામણી હબ",
    vendorsSubtitle: "ભાવની સરખામણી કરો, સંપર્કો સાચવો અને બુકિંગ ટ્રેક કરો.",
    addVendorBtn: "+ વેન્ડર ઉમેરો",
    statusNotContacted: "સંપર્ક નથી કર્યો",
    statusContacted: "સંપર્ક કરેલ છે",
    statusQuoted: "ભાવ મળેલ છે",
    statusBooked: "કન્ફર્મ / બુક કરેલ",
    statusRejected: "રદ કરેલ",
    contactPerson: "સંપર્ક વ્યક્તિ",
    phone: "ફોન / વોટ્સએપ",
    email: "ઈમેલ",
    quoteEstimated: "અંદાજિત ભાવ",
    quoteFinal: "આખરી ભાવ",
    criteriaLabel: "પસંદગીના માપદંડ / આવશ્યકતાઓ",

    save: "સાચવો",
    cancel: "રદ કરો",
    delete: "કાઢી નાખો",
    edit: "ફેરફાર કરો",
    confirmDelete: "શું તમે ખરેખર આ કાઢી નાખવા માંગો છો?",
    loading: "લોડ થઈ રહ્યું છે...",
    error: "ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.",
    success: "સફળ!",
    close: "બંધ કરો",
    selectLanguage: "ભાષા"
  }
};

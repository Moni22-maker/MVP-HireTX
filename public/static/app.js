// HireTX – National Employability Readiness System
// Frontend Application v3.0 – Complete Production Build
'use strict';

// ─── API CLIENT ───────────────────────────────────────────────────────────────
const API = axios.create({ baseURL: '/api', timeout: 20000 });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('hiretx_token');
  if (t) cfg.headers['Authorization'] = `Bearer ${t}`;
  return cfg;
});
API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { Auth.clear(); navigate('login'); }
  return Promise.reject(err);
});

// ─── GLOBAL STATE ─────────────────────────────────────────────────────────────
const State = {
  user: null, token: null, page: 'landing', charts: {},
  sim: { active: null, tasks: [], currentTaskIdx: 0, responses: {}, timer: null, startTime: null, submissionId: null, timeLimit: 3600 },
  adminData: null, evalData: null, candidateData: null, simulations: [],
  reportData: null, evalSubmission: null, analyticsData: null, usersData: null,
  locale: 'en'
};

const I18N = {
  en: {
    appTagline: 'National Employability Readiness System',
    readinessSystem: 'Readiness System',
    navigation: 'Navigation',
    signOut: 'Sign Out',
    systemOnline: 'System Online',
    pageNotFound: 'Page not found',
    signedOut: 'You have been signed out',
    dashboard: 'Dashboard',
    simulations: 'Simulations',
    myReports: 'My Reports',
    reports: 'Reports',
    profile: 'Profile',
    reviewQueue: 'Review Queue',
    analytics: 'Analytics',
    users: 'Users',
    signInToAccount: 'Sign in to your account',
    emailAddress: 'Email Address',
    password: 'Password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create account',
    backHome: 'Back to Home',
    createYourAccount: 'Create Your Account',
    joinPlatform: 'Join the national employability readiness platform',
    fullName: 'Full Name',
    username: 'Username',
    specialization: 'Specialization',
    selectField: 'Select your field',
    humanResources: 'Human Resources',
    computerScienceIt: 'Computer Science / IT',
    minimum8Characters: 'Minimum 8 characters',
    alreadyHaveAccount: 'Already have an account?',
    creatingAccount: 'Creating account...',
    accountCreatedWelcome: 'Account created! Welcome to HireTX.',
    selectSpecialization: 'Please select a specialization',
    invalidEmailOrPassword: 'Invalid email or password',
    registerFailed: 'Registration failed. Please try again.',
    welcomeBack: 'Welcome back, {name}!',
    hiretxIndex: 'HireTX Index',
    totalAttempts: 'Total Attempts',
    simulationsTaken: 'simulations taken',
    completed: 'Completed',
    fullyScored: 'fully scored',
    inProgress: 'In Progress',
    activeSessions: 'active sessions',
    basedOnBestPerformance: 'Based on best performance',
    completeSimulationToSeeIndex: 'Complete a simulation to see your index',
    tbclmProfile: 'TBCLM Profile',
    noTbclmDataYet: 'No TBCLM data yet',
    keyStrengths: 'Key Strengths',
    areasForGrowth: 'Areas for Growth',
    noStrengthsYet: 'No strengths identified yet',
    noWeaknessesYet: 'No weaknesses identified yet',
    availableSimulations: 'Available Simulations',
    viewAll: 'View All',
    noSimulationsForSpecialization: 'No simulations available for your specialization',
    recentActivity: 'Recent Activity',
    simulation: 'Simulation',
    status: 'Status',
    score: 'Score',
    date: 'Date',
    failedToLoadDashboard: 'Failed to load dashboard',
    failedToLoadDashboardRefresh: 'Failed to load dashboard. Please refresh.',
    totalCandidates: 'Total Candidates',
    activeSimulations: 'Active Simulations',
    publishedSimulations: 'published simulations',
    totalSubmissions: 'Total Submissions',
    allAttempts: 'all attempts',
    pendingReviews: 'Pending Reviews',
    awaitingEvaluation: 'awaiting evaluation',
    avgHiretxIndex: 'Avg HireTX Index',
    platformAverage: 'platform average',
    scoredSubmissions: 'Scored Submissions',
    fullyEvaluated: 'fully evaluated',
    platformTbclmAverages: 'Platform TBCLM Averages',
    readinessDistribution: 'Readiness Distribution',
    specializationDistribution: 'Specialization Distribution',
    scoreRangeDistribution: 'Score Range Distribution',
    simulationPerformance: 'Simulation Performance',
    recentRegistrations: 'Recent Registrations',
    recentAuditActivity: 'Recent Audit Activity',
    noDataAvailable: 'No data available',
    noSimulationData: 'No simulation data',
    noUsersRegistered: 'No users registered',
    failedToLoadAdminData: 'Failed to load admin data',
    failedToLoadAdminDashboard: 'Failed to load admin dashboard',
    filterSimulations: 'Filter simulations by specialization and difficulty',
    allSpecializations: 'All Specializations',
    allDifficulties: 'All Difficulties',
    searchSimulations: 'Search simulations...',
    failedToLoadSimulations: 'Failed to load simulations',
    noSimulationsFound: 'No simulations found matching your filters',
    beginSimulation: 'Begin Simulation',
    loadingSimulation: 'Loading simulation...',
    resumingPreviousAttempt: 'Resuming your previous attempt',
    failedToStartSimulation: 'Failed to start simulation',
    passScore: 'Pass',
    maxAttempts: 'Max {count} attempts',
    completedCount: '{count} completed',
    attemptLabel: 'Attempt #{count}',
    tasksLabel: '{count} Tasks',
    exit: 'Exit',
    taskProgress: 'Task {current} of {total}',
    answeredCount: '{count} answered',
    answeredOfTotal: '{answered} of {total} answered',
    previous: 'Previous',
    nextTask: 'Next Task',
    submitSimulation: 'Submit Simulation',
    noTaskFound: 'No task found',
    writeDetailedResponse: 'Write your detailed response here...',
    responseBullet1: 'Be specific and use domain terminology',
    responseBullet2: 'Structure your response clearly',
    responseBullet3: 'Minimum 50 words recommended',
    words: '{count} words',
    minWordsRecommended: 'Min. 50 words recommended for full scoring',
    scenarioContext: 'Scenario Context',
    selectBestAnswer: 'Select the best answer',
    freeTextResponse: 'Free text response',
    scenarioAnalysisRequired: 'Scenario analysis required',
    exitSimulation: 'Exit Simulation',
    exitSimulationConfirm: 'Are you sure you want to exit? Your progress will be saved as "In Progress" and you can resume later.',
    continueSimulation: 'Continue Simulation',
    exitNow: 'Exit Now',
    submitSimulationTitle: 'Submit Simulation',
    readyToSubmit: 'Ready to Submit?',
    answeredTasksSummary: 'You have answered {answered} of {total} tasks.',
    unansweredTasks: '{count} task{suffix} unanswered. Unanswered tasks will receive 0 points.',
    allTasksAnswered: 'All tasks answered!',
    reviewAnswers: 'Review Answers',
    submitNow: 'Submit Now',
    timeIsUp: 'Time is up! Auto-submitting...',
    sessionErrorRestart: 'Session error. Please restart.',
    scoringSimulation: 'Scoring your simulation...',
    pleaseWaitMoment: 'Please wait, this may take a moment',
    simulationSubmitted: 'Simulation submitted successfully!',
    submissionFailed: 'Submission failed',
    failedToSubmitSimulation: 'Failed to submit simulation',
    assessmentComplete: 'Assessment Complete',
    autoScoreUnderReview: 'Auto Score: {score}% · Under Review by Evaluator',
    tbclmBreakdown: 'TBCLM Breakdown',
    noSpecificStrengths: 'No specific strengths identified',
    continueDeveloping: 'Continue developing all dimensions',
    improvementRecommendations: 'Improvement Recommendations',
    backToDashboard: 'Back to Dashboard',
    tryAnotherSimulation: 'Try Another Simulation',
    downloadPdfReport: 'Download PDF Report',
    yourScore: 'Your Score',
    evaluatorQueueTitle: 'Evaluator - Review Queue',
    failedToLoadEvaluatorData: 'Failed to load evaluator data',
    pendingReview: 'Pending Review',
    awaitingYourReview: 'awaiting your review',
    reviewed: 'Reviewed',
    byYou: 'by you',
    avgScoreGiven: 'Avg Score Given',
    evaluationAverage: 'your evaluation average',
    pendingSubmissions: 'Pending Submissions',
    allSubmissionsReviewed: 'All submissions reviewed! Great work.',
    candidate: 'Candidate',
    autoScore: 'Auto Score',
    submitted: 'Submitted',
    action: 'Action',
    review: 'Review',
    recentlyReviewed: 'Recently Reviewed',
    finalScore: 'Final Score',
    failedToLoadEvaluatorDashboard: 'Failed to load evaluator dashboard',
    loadingSubmission: 'Loading submission...',
    failedToLoadSubmission: 'Failed to load submission',
    evaluate: 'Evaluate',
    task: 'Task',
    candidateResponse: 'Candidate Response',
    noResponseSubmitted: 'No response submitted for this task',
    evaluatorScore: 'Evaluator Score',
    optionalNotes: 'Notes (optional)',
    addScoringNotes: 'Add scoring notes...',
    scoringPanel: 'Scoring Panel',
    autoTbclmScores: 'Auto TBCLM Scores',
    overrideFinalScore: 'Override Final Score (0-100)',
    leaveBlankAutoScore: 'Leave blank to use auto-calculated score',
    generalEvaluationNotes: 'General Evaluation Notes',
    overallAssessmentPlaceholder: 'Overall assessment, qualitative observations, and recommendations...',
    submitEvaluation: 'Submit Evaluation',
    backToQueue: 'Back to Queue',
    evaluationSubmitted: 'Evaluation submitted successfully!',
    failedToSubmitEvaluation: 'Failed to submit evaluation',
    analyticsInsights: 'Analytics & Insights',
    skillGapAnalysis: 'Skill Gap Analysis by Specialization',
    submissionsCount: '{count} submissions',
    weakestDimension: 'Weakest dimension',
    noSkillGapData: 'No skill gap data available yet',
    trendingSimulations: 'Trending Simulations',
    noTrendingData: 'No trending data yet',
    topPerformers: 'Top Performers',
    noPerformerData: 'No performer data yet',
    readinessTrends30Days: 'Readiness Trends (30 days)',
    avgHiretxIndexTrend: 'Avg HireTX Index',
    failedToLoadAnalytics: 'Failed to load analytics',
    userManagement: 'User Management',
    searchUsers: 'Search by username or email...',
    allRoles: 'All Roles',
    candidates: 'Candidates',
    evaluators: 'Evaluators',
    admins: 'Admins',
    allUsers: 'All Users',
    usersLoaded: '{count} users loaded',
    user: 'User',
    role: 'Role',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    changeRole: 'Change Role',
    you: 'You',
    roleUpdated: 'Role updated successfully',
    failedToLoadUsers: 'Failed to load users',
    failedToUpdateRole: 'Failed to update role',
    reportsPerformance: 'Reports & Performance',
    failedToLoadReportData: 'Failed to load report data',
    failedToLoadReports: 'Failed to load reports',
    candidateId: 'Candidate ID',
    unrated: 'Unrated',
    noCompletedAssessments: 'No completed assessments',
    dimensionScores: 'Dimension Scores',
    assessmentHistory: 'Assessment History',
    exportPdf: 'Export PDF',
    noAssessmentsCompleted: 'No assessments completed yet. Start a simulation to build your report.',
    myProfile: 'My Profile',
    saveChanges: 'Save Changes',
    accountInformation: 'Account Information',
    memberSince: 'Member Since',
    verification: 'Verification',
    lastLogin: 'Last Login',
    verified: 'Verified',
    pending: 'Pending',
    couldNotLoadAccountDetails: 'Could not load account details',
    saving: 'Saving...',
    profileUpdated: 'Profile updated successfully!',
    profileSaved: 'Profile saved!',
    failedToUpdateProfile: 'Failed to update profile',
    generatedOn: 'Generated'
  },
  ar: {
    appTagline: 'النظام الوطني للجاهزية للتوظيف',
    readinessSystem: 'منصة الجاهزية',
    navigation: 'التنقل',
    signOut: 'تسجيل الخروج',
    systemOnline: 'النظام متصل',
    pageNotFound: 'الصفحة غير موجودة',
    signedOut: 'تم تسجيل خروجك',
    dashboard: 'لوحة التحكم',
    simulations: 'المحاكاة',
    myReports: 'تقاريري',
    reports: 'التقارير',
    profile: 'الملف الشخصي',
    reviewQueue: 'قائمة المراجعة',
    analytics: 'التحليلات',
    users: 'المستخدمون',
    signInToAccount: 'سجل الدخول إلى حسابك',
    emailAddress: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signingIn: 'جارٍ تسجيل الدخول...',
    dontHaveAccount: 'ليس لديك حساب؟',
    createAccount: 'إنشاء حساب',
    backHome: 'العودة للرئيسية',
    createYourAccount: 'أنشئ حسابك',
    joinPlatform: 'انضم إلى المنصة الوطنية لقياس الجاهزية للتوظيف',
    fullName: 'الاسم الكامل',
    username: 'اسم المستخدم',
    specialization: 'التخصص',
    selectField: 'اختر مجالك',
    humanResources: 'الموارد البشرية',
    computerScienceIt: 'علوم الحاسب / تقنية المعلومات',
    minimum8Characters: '8 أحرف على الأقل',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    creatingAccount: 'جارٍ إنشاء الحساب...',
    accountCreatedWelcome: 'تم إنشاء الحساب. أهلاً بك في HireTX.',
    selectSpecialization: 'يرجى اختيار التخصص',
    invalidEmailOrPassword: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    registerFailed: 'فشل التسجيل. حاول مرة أخرى.',
    welcomeBack: 'مرحباً بعودتك يا {name}!',
    hiretxIndex: 'مؤشر HireTX',
    totalAttempts: 'إجمالي المحاولات',
    simulationsTaken: 'عدد المحاكاة المنجزة',
    completed: 'مكتمل',
    fullyScored: 'تم تقييمه بالكامل',
    inProgress: 'قيد التنفيذ',
    activeSessions: 'جلسات نشطة',
    basedOnBestPerformance: 'استناداً إلى أفضل أداء',
    completeSimulationToSeeIndex: 'أكمل محاكاة لرؤية مؤشرك',
    tbclmProfile: 'ملف TBCLM',
    noTbclmDataYet: 'لا توجد بيانات TBCLM بعد',
    keyStrengths: 'نقاط القوة',
    areasForGrowth: 'مجالات التطوير',
    noStrengthsYet: 'لم يتم تحديد نقاط قوة بعد',
    noWeaknessesYet: 'لم يتم تحديد مجالات تطوير بعد',
    availableSimulations: 'المحاكاة المتاحة',
    viewAll: 'عرض الكل',
    noSimulationsForSpecialization: 'لا توجد محاكاة متاحة لهذا التخصص',
    recentActivity: 'النشاط الأخير',
    simulation: 'المحاكاة',
    status: 'الحالة',
    score: 'النتيجة',
    date: 'التاريخ',
    failedToLoadDashboard: 'تعذر تحميل لوحة التحكم',
    failedToLoadDashboardRefresh: 'تعذر تحميل لوحة التحكم. يرجى التحديث.',
    totalCandidates: 'إجمالي المرشحين',
    activeSimulations: 'المحاكاة النشطة',
    publishedSimulations: 'محاكاة منشورة',
    totalSubmissions: 'إجمالي الإرسالات',
    allAttempts: 'كل المحاولات',
    pendingReviews: 'المراجعات المعلقة',
    awaitingEvaluation: 'بانتظار التقييم',
    avgHiretxIndex: 'متوسط مؤشر HireTX',
    platformAverage: 'متوسط المنصة',
    scoredSubmissions: 'الإرسالات المقيمة',
    fullyEvaluated: 'تم تقييمها بالكامل',
    platformTbclmAverages: 'متوسطات TBCLM على مستوى المنصة',
    readinessDistribution: 'توزيع الجاهزية',
    specializationDistribution: 'توزيع التخصصات',
    scoreRangeDistribution: 'توزيع نطاق الدرجات',
    simulationPerformance: 'أداء المحاكاة',
    recentRegistrations: 'أحدث التسجيلات',
    recentAuditActivity: 'آخر أنشطة التدقيق',
    noDataAvailable: 'لا توجد بيانات متاحة',
    noSimulationData: 'لا توجد بيانات للمحاكاة',
    noUsersRegistered: 'لا يوجد مستخدمون مسجلون',
    failedToLoadAdminData: 'تعذر تحميل بيانات الإدارة',
    failedToLoadAdminDashboard: 'تعذر تحميل لوحة الإدارة',
    filterSimulations: 'قم بتصفية المحاكاة حسب التخصص ومستوى الصعوبة',
    allSpecializations: 'كل التخصصات',
    allDifficulties: 'كل مستويات الصعوبة',
    searchSimulations: 'ابحث في المحاكاة...',
    failedToLoadSimulations: 'تعذر تحميل المحاكاة',
    noSimulationsFound: 'لا توجد محاكاة مطابقة للفلاتر',
    beginSimulation: 'ابدأ المحاكاة',
    loadingSimulation: 'جارٍ تحميل المحاكاة...',
    resumingPreviousAttempt: 'جارٍ استكمال محاولتك السابقة',
    failedToStartSimulation: 'تعذر بدء المحاكاة',
    passScore: 'النجاح',
    maxAttempts: 'الحد الأقصى {count} محاولات',
    completedCount: '{count} مكتملة',
    attemptLabel: 'المحاولة رقم {count}',
    tasksLabel: '{count} مهام',
    exit: 'خروج',
    taskProgress: 'المهمة {current} من {total}',
    answeredCount: '{count} مجاب عنها',
    answeredOfTotal: 'تمت الإجابة على {answered} من {total}',
    previous: 'السابق',
    nextTask: 'المهمة التالية',
    submitSimulation: 'إرسال المحاكاة',
    noTaskFound: 'لم يتم العثور على المهمة',
    writeDetailedResponse: 'اكتب إجابتك التفصيلية هنا...',
    responseBullet1: 'كن محدداً واستخدم المصطلحات المتخصصة',
    responseBullet2: 'نظم إجابتك بوضوح',
    responseBullet3: 'يوصى بحد أدنى 50 كلمة',
    words: '{count} كلمة',
    minWordsRecommended: 'يوصى بحد أدنى 50 كلمة للحصول على التقييم الكامل',
    scenarioContext: 'سياق السيناريو',
    selectBestAnswer: 'اختر أفضل إجابة',
    freeTextResponse: 'إجابة نصية حرة',
    scenarioAnalysisRequired: 'يتطلب تحليلاً للموقف',
    exitSimulation: 'الخروج من المحاكاة',
    exitSimulationConfirm: 'هل أنت متأكد من رغبتك في الخروج؟ سيتم حفظ تقدمك كحالة "قيد التنفيذ" ويمكنك المتابعة لاحقاً.',
    continueSimulation: 'متابعة المحاكاة',
    exitNow: 'خروج الآن',
    submitSimulationTitle: 'إرسال المحاكاة',
    readyToSubmit: 'هل أنت جاهز للإرسال؟',
    answeredTasksSummary: 'أجبت عن {answered} من أصل {total} مهام.',
    unansweredTasks: 'هناك {count} مهمة{suffix} بدون إجابة. المهام غير المجابة ستحصل على 0 نقطة.',
    allTasksAnswered: 'تمت الإجابة على جميع المهام!',
    reviewAnswers: 'مراجعة الإجابات',
    submitNow: 'إرسال الآن',
    timeIsUp: 'انتهى الوقت. جارٍ الإرسال تلقائياً...',
    sessionErrorRestart: 'خطأ في الجلسة. يرجى إعادة البدء.',
    scoringSimulation: 'جارٍ تقييم المحاكاة...',
    pleaseWaitMoment: 'يرجى الانتظار، قد يستغرق هذا لحظة',
    simulationSubmitted: 'تم إرسال المحاكاة بنجاح!',
    submissionFailed: 'فشل الإرسال',
    failedToSubmitSimulation: 'تعذر إرسال المحاكاة',
    assessmentComplete: 'اكتمل التقييم',
    autoScoreUnderReview: 'النتيجة الآلية: {score}% · بانتظار مراجعة المقيم',
    tbclmBreakdown: 'تفصيل TBCLM',
    noSpecificStrengths: 'لم يتم تحديد نقاط قوة محددة',
    continueDeveloping: 'استمر في تطوير جميع الأبعاد',
    improvementRecommendations: 'توصيات التحسين',
    backToDashboard: 'العودة إلى لوحة التحكم',
    tryAnotherSimulation: 'جرّب محاكاة أخرى',
    downloadPdfReport: 'تنزيل تقرير PDF',
    yourScore: 'درجتك',
    evaluatorQueueTitle: 'المقيّم - قائمة المراجعة',
    failedToLoadEvaluatorData: 'تعذر تحميل بيانات المقيم',
    pendingReview: 'بانتظار المراجعة',
    awaitingYourReview: 'بانتظار مراجعتك',
    reviewed: 'تمت مراجعته',
    byYou: 'بواسطتك',
    avgScoreGiven: 'متوسط الدرجات الممنوحة',
    evaluationAverage: 'متوسط تقييمك',
    pendingSubmissions: 'الإرسالات المعلقة',
    allSubmissionsReviewed: 'تمت مراجعة كل الإرسالات. عمل رائع.',
    candidate: 'المرشح',
    autoScore: 'النتيجة الآلية',
    submitted: 'تم الإرسال',
    action: 'الإجراء',
    review: 'مراجعة',
    recentlyReviewed: 'تمت مراجعته مؤخراً',
    finalScore: 'النتيجة النهائية',
    failedToLoadEvaluatorDashboard: 'تعذر تحميل لوحة المقيم',
    loadingSubmission: 'جارٍ تحميل الإرسال...',
    failedToLoadSubmission: 'تعذر تحميل الإرسال',
    evaluate: 'تقييم',
    task: 'مهمة',
    candidateResponse: 'إجابة المرشح',
    noResponseSubmitted: 'لم يتم إرسال إجابة لهذه المهمة',
    evaluatorScore: 'درجة المقيم',
    optionalNotes: 'ملاحظات (اختياري)',
    addScoringNotes: 'أضف ملاحظات التقييم...',
    scoringPanel: 'لوحة التقييم',
    autoTbclmScores: 'درجات TBCLM الآلية',
    overrideFinalScore: 'تجاوز النتيجة النهائية (0-100)',
    leaveBlankAutoScore: 'اتركه فارغاً لاستخدام النتيجة الآلية',
    generalEvaluationNotes: 'ملاحظات التقييم العامة',
    overallAssessmentPlaceholder: 'التقييم العام والملاحظات النوعية والتوصيات...',
    submitEvaluation: 'إرسال التقييم',
    backToQueue: 'العودة إلى القائمة',
    evaluationSubmitted: 'تم إرسال التقييم بنجاح!',
    failedToSubmitEvaluation: 'تعذر إرسال التقييم',
    analyticsInsights: 'التحليلات والرؤى',
    skillGapAnalysis: 'تحليل فجوات المهارات حسب التخصص',
    submissionsCount: '{count} إرسالات',
    weakestDimension: 'أضعف بُعد',
    noSkillGapData: 'لا توجد بيانات لفجوات المهارات بعد',
    trendingSimulations: 'المحاكاة الرائجة',
    noTrendingData: 'لا توجد بيانات رائجة بعد',
    topPerformers: 'أفضل المؤدين',
    noPerformerData: 'لا توجد بيانات أداء بعد',
    readinessTrends30Days: 'اتجاهات الجاهزية (30 يوماً)',
    avgHiretxIndexTrend: 'متوسط مؤشر HireTX',
    failedToLoadAnalytics: 'تعذر تحميل التحليلات',
    userManagement: 'إدارة المستخدمين',
    searchUsers: 'ابحث باسم المستخدم أو البريد الإلكتروني...',
    allRoles: 'كل الأدوار',
    candidates: 'المرشحون',
    evaluators: 'المقيّمون',
    admins: 'المديرون',
    allUsers: 'كل المستخدمين',
    usersLoaded: 'تم تحميل {count} مستخدم',
    user: 'المستخدم',
    role: 'الدور',
    actions: 'الإجراءات',
    active: 'نشط',
    inactive: 'غير نشط',
    changeRole: 'تغيير الدور',
    you: 'أنت',
    roleUpdated: 'تم تحديث الدور بنجاح',
    failedToLoadUsers: 'تعذر تحميل المستخدمين',
    failedToUpdateRole: 'تعذر تحديث الدور',
    reportsPerformance: 'التقارير والأداء',
    failedToLoadReportData: 'تعذر تحميل بيانات التقرير',
    failedToLoadReports: 'تعذر تحميل التقارير',
    candidateId: 'معرف المرشح',
    unrated: 'غير مقيم',
    noCompletedAssessments: 'لا توجد تقييمات مكتملة',
    dimensionScores: 'درجات الأبعاد',
    assessmentHistory: 'سجل التقييمات',
    exportPdf: 'تصدير PDF',
    noAssessmentsCompleted: 'لا توجد تقييمات مكتملة بعد. ابدأ محاكاة لبناء تقريرك.',
    myProfile: 'ملفي الشخصي',
    saveChanges: 'حفظ التغييرات',
    accountInformation: 'معلومات الحساب',
    memberSince: 'عضو منذ',
    verification: 'التحقق',
    lastLogin: 'آخر تسجيل دخول',
    verified: 'موثق',
    pending: 'قيد الانتظار',
    couldNotLoadAccountDetails: 'تعذر تحميل تفاصيل الحساب',
    saving: 'جارٍ الحفظ...',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح!',
    profileSaved: 'تم حفظ الملف الشخصي!',
    failedToUpdateProfile: 'تعذر تحديث الملف الشخصي',
    generatedOn: 'تاريخ الإنشاء'
  }
};

function t(key, vars = {}) {
  const locale = State.locale in I18N ? State.locale : 'en';
  const table = I18N[locale] || I18N.en;
  const template = table[key] || I18N.en[key] || key;
  return Object.entries(vars).reduce((out, [name, value]) => out.replaceAll(`{${name}}`, value), template);
}

function currentLocale() {
  return State.locale === 'ar' ? 'ar' : 'en';
}

function isRTL() {
  return currentLocale() === 'ar';
}

function applyLocaleSettings() {
  const locale = currentLocale();
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.title = locale === 'ar' ? 'HireTX - النظام الوطني للجاهزية للتوظيف' : 'HireTX - National Employability Readiness System';
}

function loadLocale() {
  try {
    const saved = localStorage.getItem('hiretx_locale');
    State.locale = saved === 'ar' ? 'ar' : 'en';
  } catch {
    State.locale = 'en';
  }
  applyLocaleSettings();
}

function setLocale(locale) {
  State.locale = locale === 'ar' ? 'ar' : 'en';
  localStorage.setItem('hiretx_locale', State.locale);
  applyLocaleSettings();
  render();
}

function syncLocaleSwitcher() {
  let switcher = document.getElementById('locale-switcher');
  if (!switcher) {
    switcher = document.createElement('div');
    switcher.id = 'locale-switcher';
    switcher.className = 'locale-switcher';
    document.body.appendChild(switcher);
  }
  switcher.innerHTML = `
    <button type="button" class="${currentLocale() === 'en' ? 'active' : ''}" onclick="setLocale('en')">EN</button>
    <button type="button" class="${currentLocale() === 'ar' ? 'active' : ''}" onclick="setLocale('ar')">AR</button>
  `;
}

function formatDate(value, options) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(currentLocale() === 'ar' ? 'ar' : 'en-US', options || {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(typeof value === 'number' ? new Date(value) : value);
}

function formatDateTime(value, options) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(currentLocale() === 'ar' ? 'ar' : 'en-US', options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(typeof value === 'number' ? new Date(value) : value);
}

function difficultyLabel(level) {
  const labels = {
    beginner: { en: 'Beginner', ar: 'مبتدئ' },
    intermediate: { en: 'Intermediate', ar: 'متوسط' },
    advanced: { en: 'Advanced', ar: 'متقدم' },
    expert: { en: 'Expert', ar: 'خبير' }
  };
  return labels[level]?.[currentLocale()] || level || '—';
}

function specializationLabel(spec, short = false) {
  if (short) {
    const shortLabels = {
      human_resources: { en: 'HR', ar: 'موارد' },
      computer_science: { en: 'IT', ar: 'تقنية' }
    };
    return shortLabels[spec]?.[currentLocale()] || '—';
  }
  const labels = {
    human_resources: { en: t('humanResources'), ar: t('humanResources') },
    computer_science: { en: t('computerScienceIt'), ar: t('computerScienceIt') },
    none: { en: 'Not Set', ar: 'غير محدد' }
  };
  return labels[spec]?.[currentLocale()] || (spec ? spec.replaceAll('_', ' ') : labels.none[currentLocale()]);
}

function roleLabel(role) {
  const labels = {
    candidate: { en: 'Candidate', ar: 'مرشح' },
    evaluator: { en: 'Evaluator', ar: 'مقيّم' },
    admin: { en: 'Admin', ar: 'مدير' },
    super_admin: { en: 'Super Admin', ar: 'مدير أعلى' }
  };
  return labels[role]?.[currentLocale()] || role || '—';
}

function statusLabel(status) {
  const labels = {
    in_progress: { en: t('inProgress'), ar: t('inProgress') },
    submitted: { en: t('submitted'), ar: t('submitted') },
    under_review: { en: 'Under Review', ar: 'قيد المراجعة' },
    scored: { en: 'Scored', ar: 'تم التقييم' },
    archived: { en: 'Archived', ar: 'مؤرشف' }
  };
  return labels[status]?.[currentLocale()] || status || '—';
}

function readinessLabel(level) {
  const labels = {
    'Ready for Immediate Employment': { en: 'Ready for Immediate Employment', ar: 'جاهز للتوظيف الفوري' },
    'Professionally Prepared': { en: 'Professionally Prepared', ar: 'مستعد مهنياً' },
    'Developing Professional': { en: 'Developing Professional', ar: 'قيد التطور المهني' },
    'Needs Structured Development': { en: 'Needs Structured Development', ar: 'بحاجة إلى تطوير منظم' },
    'No Data': { en: 'No Data', ar: 'لا توجد بيانات' },
    'Not Assessed': { en: 'Not Assessed', ar: 'غير مقيم' }
  };
  return labels[level]?.[currentLocale()] || level || t('unrated');
}

function axisLabel(code, variant = 'short') {
  const labels = {
    T: { short: { en: 'Technical', ar: 'تقني' }, long: { en: 'Technical Competency', ar: 'الكفاءة التقنية' } },
    B: { short: { en: 'Behavioral', ar: 'سلوكي' }, long: { en: 'Behavioral Skills', ar: 'المهارات السلوكية' } },
    C: { short: { en: 'Cognitive', ar: 'معرفي' }, long: { en: 'Cognitive Ability', ar: 'القدرة المعرفية' } },
    L: { short: { en: 'Leadership', ar: 'قيادة' }, long: { en: 'Leadership & Professionalism', ar: 'القيادة والاحترافية' } },
    M: { short: { en: 'Market', ar: 'السوق' }, long: { en: 'Market Readiness', ar: 'الجاهزية لسوق العمل' } }
  };
  return labels[code]?.[variant]?.[currentLocale()] || code;
}

function translateApiMessage(message) {
  const map = {
    'Username, email, and password are required': { en: 'Username, email, and password are required', ar: 'اسم المستخدم والبريد الإلكتروني وكلمة المرور مطلوبة' },
    'Password must be at least 8 characters': { en: 'Password must be at least 8 characters', ar: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' },
    'Username must be 3-30 alphanumeric characters or underscores': { en: 'Username must be 3-30 alphanumeric characters or underscores', ar: 'يجب أن يتكون اسم المستخدم من 3 إلى 30 حرفاً أو رقماً أو شرطة سفلية' },
    'Username or email already registered': { en: 'Username or email already registered', ar: 'اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً' },
    'Registration successful': { en: 'Registration successful', ar: 'تم التسجيل بنجاح' },
    'Registration failed. Please try again.': { en: 'Registration failed. Please try again.', ar: 'فشل التسجيل. حاول مرة أخرى.' },
    'Email and password are required': { en: 'Email and password are required', ar: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
    'Invalid credentials': { en: t('invalidEmailOrPassword'), ar: t('invalidEmailOrPassword') },
    'Login successful': { en: 'Login successful', ar: 'تم تسجيل الدخول بنجاح' },
    'Login failed. Please try again.': { en: 'Login failed. Please try again.', ar: 'فشل تسجيل الدخول. حاول مرة أخرى.' },
    'Failed to load dashboard': { en: t('failedToLoadDashboard'), ar: t('failedToLoadDashboard') },
    'Failed to load admin dashboard': { en: t('failedToLoadAdminDashboard'), ar: t('failedToLoadAdminDashboard') },
    'Failed to fetch users': { en: t('failedToLoadUsers'), ar: t('failedToLoadUsers') },
    'User role updated successfully': { en: t('roleUpdated'), ar: t('roleUpdated') },
    'Failed to update user role': { en: t('failedToUpdateRole'), ar: t('failedToUpdateRole') },
    'Profile updated successfully': { en: t('profileUpdated'), ar: t('profileUpdated') },
    'Profile update failed': { en: t('failedToUpdateProfile'), ar: t('failedToUpdateProfile') }
  };
  return map[message]?.[currentLocale()] || message;
}

const STATIC_ARABIC_TEXT = new Map([
  ['Dashboard', 'لوحة التحكم'],
  ['Simulations', 'المحاكاة'],
  ['My Reports', 'تقاريري'],
  ['Reports', 'التقارير'],
  ['Profile', 'الملف الشخصي'],
  ['Analytics', 'التحليلات'],
  ['Users', 'المستخدمون'],
  ['Review Queue', 'قائمة المراجعة'],
  ['Admin Dashboard', 'لوحة الإدارة'],
  ['Super Admin Dashboard', 'لوحة الإدارة العليا'],
  ['Evaluator - Review Queue', 'المقيّم - قائمة المراجعة'],
  ['Navigation', 'التنقل'],
  ['System Online', 'النظام متصل'],
  ['Sign Out', 'تسجيل الخروج'],
  ['Total Attempts', 'إجمالي المحاولات'],
  ['Completed', 'مكتمل'],
  ['In Progress', 'قيد التنفيذ'],
  ['Specialization', 'التخصص'],
  ['TBCLM Profile', 'ملف TBCLM'],
  ['Key Strengths', 'نقاط القوة'],
  ['Areas for Growth', 'مجالات التطوير'],
  ['Available Simulations', 'المحاكاة المتاحة'],
  ['View All', 'عرض الكل'],
  ['Recent Activity', 'النشاط الأخير'],
  ['Simulation', 'المحاكاة'],
  ['Status', 'الحالة'],
  ['Score', 'النتيجة'],
  ['Date', 'التاريخ'],
  ['HireTX Index', 'مؤشر HireTX'],
  ['Assessment Complete', 'اكتمل التقييم'],
  ['TBCLM Breakdown', 'تفصيل TBCLM'],
  ['Improvement Recommendations', 'توصيات التحسين'],
  ['Back to Dashboard', 'العودة إلى لوحة التحكم'],
  ['Try Another Simulation', 'جرّب محاكاة أخرى'],
  ['Download PDF Report', 'تنزيل تقرير PDF'],
  ['Pending Review', 'بانتظار المراجعة'],
  ['Reviewed', 'تمت مراجعته'],
  ['Avg Score Given', 'متوسط الدرجات الممنوحة'],
  ['Pending Submissions', 'الإرسالات المعلقة'],
  ['Candidate', 'المرشح'],
  ['Auto Score', 'النتيجة الآلية'],
  ['Submitted', 'تم الإرسال'],
  ['Action', 'الإجراء'],
  ['Review', 'مراجعة'],
  ['Recently Reviewed', 'تمت مراجعته مؤخراً'],
  ['Final Score', 'النتيجة النهائية'],
  ['Analytics & Insights', 'التحليلات والرؤى'],
  ['Skill Gap Analysis by Specialization', 'تحليل فجوات المهارات حسب التخصص'],
  ['Trending Simulations', 'المحاكاة الرائجة'],
  ['Top Performers', 'أفضل المؤدين'],
  ['Readiness Trends (30 days)', 'اتجاهات الجاهزية (30 يوماً)'],
  ['User Management', 'إدارة المستخدمين'],
  ['All Roles', 'كل الأدوار'],
  ['Candidates', 'المرشحون'],
  ['Evaluators', 'المقيّمون'],
  ['Admins', 'المديرون'],
  ['All Users', 'كل المستخدمين'],
  ['User', 'المستخدم'],
  ['Role', 'الدور'],
  ['Actions', 'الإجراءات'],
  ['Active', 'نشط'],
  ['Inactive', 'غير نشط'],
  ['Change Role', 'تغيير الدور'],
  ['You', 'أنت'],
  ['Reports & Performance', 'التقارير والأداء'],
  ['Assessment History', 'سجل التقييمات'],
  ['Export PDF', 'تصدير PDF'],
  ['My Profile', 'ملفي الشخصي'],
  ['Full Name', 'الاسم الكامل'],
  ['Email', 'البريد الإلكتروني'],
  ['Username', 'اسم المستخدم'],
  ['Save Changes', 'حفظ التغييرات'],
  ['Account Information', 'معلومات الحساب'],
  ['Member Since', 'عضو منذ'],
  ['Verification', 'التحقق'],
  ['Last Login', 'آخر تسجيل دخول'],
  ['Verified', 'موثق'],
  ['Pending', 'قيد الانتظار'],
  ['Begin Simulation', 'ابدأ المحاكاة'],
  ['Exit', 'خروج'],
  ['Previous', 'السابق'],
  ['Next Task', 'المهمة التالية'],
  ['Submit Simulation', 'إرسال المحاكاة'],
  ['Scenario Context', 'سياق السيناريو'],
  ['Select the best answer', 'اختر أفضل إجابة'],
  ['Free text response', 'إجابة نصية حرة'],
  ['Scenario analysis required', 'يتطلب تحليلاً للموقف'],
  ['Exit Simulation', 'الخروج من المحاكاة'],
  ['Continue Simulation', 'متابعة المحاكاة'],
  ['Exit Now', 'خروج الآن'],
  ['Ready to Submit?', 'هل أنت جاهز للإرسال؟'],
  ['Review Answers', 'مراجعة الإجابات'],
  ['Submit Now', 'إرسال الآن'],
  ['All tasks answered!', 'تمت الإجابة على جميع المهام!'],
  ['No TBCLM data yet', 'لا توجد بيانات TBCLM بعد'],
  ['No strengths identified yet', 'لم يتم تحديد نقاط قوة بعد'],
  ['No weaknesses identified yet', 'لم يتم تحديد مجالات تطوير بعد'],
  ['No simulations available for your specialization', 'لا توجد محاكاة متاحة لهذا التخصص'],
  ['No simulations found matching your filters', 'لا توجد محاكاة مطابقة للفلاتر'],
  ['No completed assessments', 'لا توجد تقييمات مكتملة'],
  ['No assessments completed yet. Start a simulation to build your report.', 'لا توجد تقييمات مكتملة بعد. ابدأ محاكاة لبناء تقريرك.'],
  ['Failed to load reports', 'تعذر تحميل التقارير'],
  ['Failed to load analytics', 'تعذر تحميل التحليلات'],
  ['Failed to load users', 'تعذر تحميل المستخدمين'],
  ['Failed to load evaluator dashboard', 'تعذر تحميل لوحة المقيم'],
  ['Failed to load dashboard. Please refresh.', 'تعذر تحميل لوحة التحكم. يرجى التحديث.'],
  ['Under Review', 'قيد المراجعة'],
  ['Scored', 'تم التقييم'],
  ['Archived', 'مؤرشف'],
  ['Ready for Immediate Employment', 'جاهز للتوظيف الفوري'],
  ['Professionally Prepared', 'مستعد مهنياً'],
  ['Developing Professional', 'قيد التطور المهني'],
  ['Needs Structured Development', 'بحاجة إلى تطوير منظم'],
  ['No Data', 'لا توجد بيانات'],
  ['Not Assessed', 'غير مقيم'],
  ['Technical', 'تقني'],
  ['Behavioral', 'سلوكي'],
  ['Cognitive', 'معرفي'],
  ['Leadership', 'قيادة'],
  ['Market', 'السوق'],
  ['Technical Competency', 'الكفاءة التقنية'],
  ['Behavioral Skills', 'المهارات السلوكية'],
  ['Cognitive Ability', 'القدرة المعرفية'],
  ['Leadership & Professionalism', 'القيادة والاحترافية'],
  ['Market Readiness', 'الجاهزية لسوق العمل'],
  ['Human Resources', 'الموارد البشرية'],
  ['Computer Science / IT', 'علوم الحاسب / تقنية المعلومات'],
  ['candidate', 'مرشح'],
  ['evaluator', 'مقيّم'],
  ['admin', 'مدير'],
  ['super admin', 'مدير أعلى'],
  ['Candidate', 'مرشح'],
  ['Evaluator', 'مقيّم'],
  ['Admin', 'مدير'],
  ['Super Admin', 'مدير أعلى'],
  ['Not Set', 'غير محدد'],
  ['Unknown', 'غير معروف'],
  ['Beginner', 'مبتدئ'],
  ['Intermediate', 'متوسط'],
  ['Advanced', 'متقدم'],
  ['Expert', 'خبير'],
  ['beginner', 'مبتدئ'],
  ['intermediate', 'متوسط'],
  ['advanced', 'متقدم'],
  ['expert', 'خبير'],
  ['Search simulations...', 'ابحث في المحاكاة...'],
  ['Search by username or email...', 'ابحث باسم المستخدم أو البريد الإلكتروني...'],
  ['Select your field', 'اختر مجالك'],
  ['Minimum 8 characters', '8 أحرف على الأقل'],
  ['Creating account...', 'جارٍ إنشاء الحساب...'],
  ['Signing in...', 'جارٍ تسجيل الدخول...'],
  ['Scoring your simulation...', 'جارٍ تقييم المحاكاة...'],
  ['Please wait, this may take a moment', 'يرجى الانتظار، قد يستغرق هذا لحظة'],
  ['Simulation submitted successfully!', 'تم إرسال المحاكاة بنجاح!'],
  ['Time is up! Auto-submitting...', 'انتهى الوقت. جارٍ الإرسال تلقائياً...'],
  ['Resuming your previous attempt', 'جارٍ استكمال محاولتك السابقة'],
  ['Profile updated successfully!', 'تم تحديث الملف الشخصي بنجاح!'],
  ['Profile saved!', 'تم حفظ الملف الشخصي!'],
  ['You have been signed out', 'تم تسجيل خروجك']
]);

function localizeLiteral(value) {
  if (currentLocale() !== 'ar' || !value) return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  return STATIC_ARABIC_TEXT.get(trimmed) || value;
}

function localizePattern(value) {
  if (currentLocale() !== 'ar' || !value) return value;
  const patterns = [
    [/^Pass:\s*/u, 'النجاح: '],
    [/^Task (\d+) of (\d+)$/u, 'المهمة $1 من $2'],
    [/^(\d+) answered$/u, '$1 مجاب عنها'],
    [/^(\d+) of (\d+) answered$/u, 'تمت الإجابة على $1 من $2'],
    [/^Attempt #(\d+) · (\d+) Tasks$/u, 'المحاولة رقم $1 · $2 مهام'],
    [/^Auto Score: ([\d.]+)% · Under Review by Evaluator$/u, 'النتيجة الآلية: $1% · بانتظار مراجعة المقيم'],
    [/^Candidate ID:\s*/u, 'معرف المرشح: '],
    [/^Loading simulation\.\.\.$/u, 'جارٍ تحميل المحاكاة...'],
    [/^Loading submission\.\.\.$/u, 'جارٍ تحميل الإرسال...'],
    [/^Role updated successfully$/u, 'تم تحديث الدور بنجاح'],
    [/^Profile updated successfully!$/u, 'تم تحديث الملف الشخصي بنجاح!'],
    [/^Profile saved!$/u, 'تم حفظ الملف الشخصي!'],
    [/^Evaluate:\s*/u, 'تقييم: '],
    [/^You have answered (\d+) of (\d+) tasks\.$/u, 'أجبت عن $1 من أصل $2 مهام.'],
    [/^(\d+) tasks? unanswered\. Unanswered tasks will receive 0 points\.$/u, 'هناك $1 مهمة بدون إجابة. المهام غير المجابة ستحصل على 0 نقطة.'],
    [/^Write your detailed response here\.\.\.$/u, 'اكتب إجابتك التفصيلية هنا...'],
    [/^(\d+) words$/u, '$1 كلمة']
  ];
  let out = value;
  patterns.forEach(([pattern, replacement]) => {
    out = out.replace(pattern, replacement);
  });
  return out;
}

function localizeStaticUI(root = document.body) {
  if (currentLocale() !== 'ar' || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const translated = localizePattern(localizeLiteral(node.textContent));
    if (translated !== node.textContent) node.textContent = translated;
  });
  root.querySelectorAll?.('input[placeholder], textarea[placeholder]').forEach((el) => {
    const translated = localizePattern(localizeLiteral(el.getAttribute('placeholder')));
    if (translated) el.setAttribute('placeholder', translated);
  });
}

function startLocalizationObserver() {
  const observer = new MutationObserver((mutations) => {
    if (currentLocale() !== 'ar' || State.page === 'landing') return;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          localizeStaticUI(node);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
const Auth = {
  load() {
    try {
      const t = localStorage.getItem('hiretx_token');
      const u = localStorage.getItem('hiretx_user');
      if (t && u) { State.token = t; State.user = JSON.parse(u); return true; }
    } catch {}
    return false;
  },
  save(token, user) {
    localStorage.setItem('hiretx_token', token);
    localStorage.setItem('hiretx_user', JSON.stringify(user));
    State.token = token; State.user = user;
  },
  clear() {
    localStorage.removeItem('hiretx_token');
    localStorage.removeItem('hiretx_user');
    State.token = null; State.user = null;
  },
  isLoggedIn() { return !!State.token && !!State.user; },
  role() { return State.user?.role || 'candidate'; },
  can(minRole) {
    const h = { candidate: 1, evaluator: 2, admin: 3, super_admin: 4 };
    return (h[Auth.role()] || 0) >= (h[minRole] || 1);
  }
};

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function notify(msg, type = 'info', ms = 4500) {
  const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' };
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'} mr-2"></i>${msg}`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, ms);
}

// ─── ROUTER ────────────────────────────────────────────────────────────────────
function navigate(page, data = {}) {
  Object.values(State.charts).forEach(c => { try { c.destroy(); } catch {} });
  State.charts = {};
  if (State.sim.timer) { clearInterval(State.sim.timer); State.sim.timer = null; }
  State.page = page;
  Object.assign(State, data);
  render();
}

function render() {
  applyLocaleSettings();
  const app = document.getElementById('app');
  if (!app) return;
  if (!Auth.isLoggedIn() && !['landing', 'login', 'register'].includes(State.page)) {
    renderLogin(); return;
  }
  const pages = {
    landing: renderLandingShared, login: renderLogin, register: renderRegister,
    dashboard: renderDashboard, simulations: renderSimulationsList,
    sim_active: renderSimulationActive, sim_result: renderSimulationResult,
    analytics: renderAnalytics, users: renderUsers, reports: renderReports,
    profile: renderProfile, evaluator: renderEvaluatorDashboard, evaluate: renderEvaluationPanel
  };
  const fn = pages[State.page];
  if (fn) fn();
  else app.innerHTML = `<div class="page-loading"><p style="color:#666">${t('pageNotFound')}</p></div>`;
  syncLocaleSwitcher();
  if (currentLocale() === 'ar' && State.page !== 'landing') localizeStaticUI(app);
}

// ─── LAYOUT ─────────────────────────────────────────────────────────────────────
function renderWithLayout(title, contentHTML) {
  const app = document.getElementById('app');
  app.innerHTML = `
  <div class="main-layout">
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="flex items-center gap-2">
          <div class="gold-gradient rounded-lg flex items-center justify-center" style="width:36px;height:36px;flex-shrink:0">
            <span style="font-weight:900;font-size:14px;color:#000;letter-spacing:-0.5px">HX</span>
          </div>
          <div>
            <div style="font-weight:800;font-size:16px;color:#fff;letter-spacing:-0.5px">HireTX</div>
            <div style="font-size:9px;color:#444;letter-spacing:1.2px;text-transform:uppercase">${t('readinessSystem')}</div>
          </div>
        </div>
      </div>
      <div class="sidebar-section flex-1" style="overflow-y:auto;padding-top:8px">${getSidebarItems()}</div>
      <div style="padding:12px 14px;border-top:1px solid #1a1a1a">
        <div class="flex items-center gap-2 mb-2">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#000;flex-shrink:0">
            ${(State.user?.full_name || State.user?.username || 'U')[0].toUpperCase()}
          </div>
          <div style="overflow:hidden;flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;color:#eee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${State.user?.full_name || State.user?.username}</div>
            <div style="font-size:10px;color:#555;text-transform:capitalize">${roleLabel(State.user?.role || '')}</div>
          </div>
        </div>
        <button class="btn-ghost w-full" style="font-size:11px;padding:6px;justify-content:center" onclick="logout()"><i class="fas fa-sign-out-alt mr-1"></i>${t('signOut')}</button>
      </div>
    </nav>
    <div class="main-content flex flex-col" style="min-height:100vh">
      <div class="topbar">
        <div class="flex items-center gap-3">
          <button onclick="document.getElementById('sidebar').classList.toggle('hidden')" style="display:none;background:none;border:none;color:#666;font-size:18px;cursor:pointer;padding:4px" id="menu-btn"><i class="fas fa-bars"></i></button>
          <span style="font-weight:700;font-size:15px;color:#eee">${title}</span>
        </div>
        <div class="flex items-center gap-3">
          <span style="font-size:11px;color:#444">${formatDate(new Date())}</span>
          <div class="status-badge badge-green"><i class="fas fa-circle" style="font-size:6px;margin-right:4px"></i>${t('systemOnline')}</div>
        </div>
      </div>
      <div class="content-area flex-1 fade-in" id="page-content">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>
    </div>
  </div>`;
  setTimeout(() => {
    const pc = document.getElementById('page-content');
    if (pc) { pc.innerHTML = contentHTML; attachPageEvents(); }
  }, 20);
}

function getSidebarItems() {
  const role = Auth.role(), pg = State.page;
  let items = [];
  if (role === 'candidate') {
    items = [
      { icon: 'th-large', label: t('dashboard'), page: 'dashboard' },
      { icon: 'play-circle', label: t('simulations'), page: 'simulations' },
      { icon: 'chart-line', label: t('myReports'), page: 'reports' },
      { icon: 'user-circle', label: t('profile'), page: 'profile' }
    ];
  } else if (role === 'evaluator') {
    items = [
      { icon: 'clipboard-list', label: t('reviewQueue'), page: 'evaluator' },
      { icon: 'play-circle', label: t('simulations'), page: 'simulations' },
      { icon: 'user-circle', label: t('profile'), page: 'profile' }
    ];
  } else if (Auth.can('admin')) {
    items = [
      { icon: 'th-large', label: t('dashboard'), page: 'dashboard' },
      { icon: 'play-circle', label: t('simulations'), page: 'simulations' },
      { icon: 'chart-bar', label: t('analytics'), page: 'analytics' },
      { icon: 'users', label: t('users'), page: 'users' },
      { icon: 'file-pdf', label: t('reports'), page: 'reports' },
      { icon: 'user-circle', label: t('profile'), page: 'profile' }
    ];
  }
  return `<div class="sidebar-label">${t('navigation')}</div>
  ${items.map(it => `<div class="sidebar-item ${pg === it.page ? 'active' : ''}" onclick="navigate('${it.page}')">
    <i class="fas fa-${it.icon}"></i><span>${it.label}</span>
  </div>`).join('')}`;
}

function attachPageEvents() {}

function logout() {
  Auth.clear();
  State.user = null; State.token = null;
  navigate('landing');
  notify(t('signedOut'), 'info');
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
function renderLanding() {
  if (currentLocale() === 'en') {
    renderLandingLegacy();
    return;
  }
  const heroStats = [
    { value: '8,420', label: 'جلسة تقييم مكتملة' },
    { value: '127', label: 'محاكاة وظيفية' },
    { value: '91%', label: 'معدل اجتياز أولي' }
  ];
  const steps = [
    { number: '1', title: 'سجل', text: 'أنشئ حسابك وحدد المسار المهني المناسب لك.' },
    { number: '2', title: 'اختر المسار', text: 'ابدأ بمحاكاة الموارد البشرية أو تقنية المعلومات.' },
    { number: '3', title: 'نفذ المهام المهنية', text: 'أجب على سيناريوهات واقعية تقيس جاهزيتك الفعلية.' },
    { number: '4', title: 'تحصل على تحليل TBCLM', text: 'شاهد توزيع نقاطك عبر المحاور الخمسة بوضوح.' },
    { number: '5', title: 'احصل على تقريرك', text: 'استلم تقريراً قابلاً للمشاركة مع توصيات تطوير مباشرة.' }
  ];
  const axes = [
    { key: 'T', title: 'المهارات التقنية', weight: '30%', icon: 'gear', color: '#68a4ff', note: 'المعرفة التخصصية وتطبيقاتها العملية' },
    { key: 'B', title: 'السلوكيات الاحترافية', weight: '25%', icon: 'brain', color: '#f375d6', note: 'التواصل والالتزام والمرونة' },
    { key: 'C', title: 'التحليل واتخاذ القرار', weight: '20%', icon: 'gavel', color: '#65d3ff', note: 'المنطق وحل المشكلات تحت الضغط' },
    { key: 'L', title: 'القيادة والتأثير', weight: '15%', icon: 'bullseye', color: '#ffb53c', note: 'المبادرة والتنظيم وتحمل المسؤولية' },
    { key: 'M', title: 'الجاهزية لسوق العمل', weight: '10%', icon: 'chart-column', color: '#5df2b1', note: 'الوعي المهني والقدرة على التكيف' }
  ];
  const trackCards = [
    {
      badge: 'HR',
      meta: '20 سيناريو . موارد بشرية',
      title: 'إدارة الموارد البشرية',
      text: 'محاكاة تغطي التوظيف، علاقات الموظفين، الامتثال، وإدارة الأداء داخل بيئة عمل حقيقية.',
      chips: ['التوظيف', 'الأداء', 'المقابلات', 'السياسات'],
      tone: 'gold'
    },
    {
      badge: 'IT',
      meta: '18 سيناريو . تقنية معلومات',
      title: 'تشغيل تكنولوجيا المعلومات',
      text: 'مهام عملية في الدعم الفني، إدارة الأنظمة، استكشاف الأعطال، والتواصل مع أصحاب المصلحة.',
      chips: ['الدعم', 'الشبكات', 'الأنظمة', 'التحليل'],
      tone: 'blue'
    }
  ];
  const comparisonRows = [
    { label: 'محاكاة عمل واقعية', hiretx: true, legacy: false },
    { label: 'تقييم جاهزية متعدد الأبعاد', hiretx: true, legacy: false },
    { label: 'قياس موزون وفق TBCLM', hiretx: true, legacy: false },
    { label: 'تقرير تطوير شخصي', hiretx: true, legacy: false },
    { label: 'نتيجة واضحة قابلة للمشاركة', hiretx: true, legacy: false }
  ];
  const readinessRows = [
    { score: '84', label: 'جاهز للعمل', width: '84%', tone: '#1fe0a4' },
    { score: '90', label: 'T', width: '90%', tone: '#f2b53d' },
    { score: '82', label: 'B', width: '82%', tone: '#f2b53d' },
    { score: '76', label: 'C', width: '76%', tone: '#f2b53d' },
    { score: '71', label: 'L', width: '71%', tone: '#f2b53d' },
    { score: '88', label: 'M', width: '88%', tone: '#f2b53d' }
  ];

  const statsHTML = heroStats.map((item) => `
    <div class="landing-stat">
      <strong>${item.value}</strong>
      <span>${item.label}</span>
    </div>
  `).join('');

  const stepsHTML = steps.map((step) => `
    <div class="landing-step">
      <div class="landing-step__bubble">${step.number}</div>
      <h3>${step.title}</h3>
      <p>${step.text}</p>
    </div>
  `).join('');

  const axesCardsHTML = axes.map((axis) => `
    <div class="landing-axis-card">
      <div class="landing-axis-card__icon" style="background:${axis.color}16;border-color:${axis.color}33">
        <i class="fas fa-${axis.icon}" style="color:${axis.color}"></i>
      </div>
      <div class="landing-axis-card__meta">
        <span>${axis.key}</span>
        <strong>${axis.title}</strong>
        <small>${axis.note}</small>
      </div>
      <div class="landing-axis-card__weight" style="color:${axis.color}">${axis.weight}</div>
    </div>
  `).join('');

  const axesRowsHTML = axes.map((axis) => `
    <div class="landing-axis-row">
      <span>${axis.weight}</span>
      <strong>${axis.title}</strong>
      <em style="color:${axis.color}">${axis.key}</em>
    </div>
  `).join('');

  const tracksHTML = trackCards.map((track) => `
    <article class="landing-track ${track.tone === 'blue' ? 'landing-track--blue' : ''}">
      <div class="landing-track__top">
        <span>${track.meta}</span>
        <div class="landing-track__badge">${track.badge}</div>
      </div>
      <h3>${track.title}</h3>
      <p>${track.text}</p>
      <div class="landing-track__chips">
        ${track.chips.map((chip) => `<span>${chip}</span>`).join('')}
      </div>
      <button onclick="navigate('register')">ابدأ المسار <i class="fas fa-arrow-left"></i></button>
    </article>
  `).join('');

  const comparisonHTML = comparisonRows.map((row) => `
    <div class="landing-compare__row">
      <span>${row.legacy ? '<i class="fas fa-check"></i>' : '<i class="fas fa-xmark"></i>'}</span>
      <strong>${row.hiretx ? '<i class="fas fa-circle-check"></i>' : '<i class="fas fa-xmark"></i>'}</strong>
      <p>${row.label}</p>
    </div>
  `).join('');

  const readinessHTML = readinessRows.map((row, index) => `
    <div class="landing-card__row ${index === 0 ? 'landing-card__row--headline' : ''}">
      <span>${row.score}%</span>
      <div class="landing-card__bar">
        <div style="width:${row.width};background:${row.tone}"></div>
      </div>
      <strong>${row.label}</strong>
    </div>
  `).join('');

  document.getElementById('app').innerHTML = `
  <style>
    .landing-shell {
      min-height: 100vh;
      background:
        radial-gradient(circle at top center, rgba(255, 188, 33, 0.18), transparent 34%),
        radial-gradient(circle at 12% 10%, rgba(255, 188, 33, 0.08), transparent 24%),
        linear-gradient(180deg, #090909 0%, #050505 100%);
      color: #f5efe1;
      direction: rtl;
      font-family: 'Cairo', 'Inter', sans-serif;
    }
    .landing-shell * { box-sizing: border-box; }
    .landing-container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    .landing-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(18px);
      background: rgba(7, 7, 7, 0.88);
      border-bottom: 1px solid rgba(255, 191, 54, 0.08);
    }
    .landing-nav__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 18px 0;
    }
    .landing-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .landing-brand__mark {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: linear-gradient(135deg, #ffcc45 0%, #d79a14 100%);
      color: #151007;
      display: grid;
      place-items: center;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .landing-brand strong {
      display: block;
      color: #fff1cd;
      font-size: 18px;
      line-height: 1;
    }
    .landing-brand span {
      display: block;
      color: #8f7e59;
      font-size: 10px;
      margin-top: 4px;
    }
    .landing-links, .landing-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .landing-links a {
      color: #b9aa8a;
      font-size: 14px;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .landing-links a:hover { color: #fff3cd; }
    .landing-btn {
      border-radius: 14px;
      border: 1px solid rgba(255, 195, 64, 0.22);
      padding: 12px 24px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }
    .landing-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
    .landing-btn:focus { outline: 2px solid #ffd700; outline-offset: 2px; }
    .landing-btn:active { transform: translateY(0); }
    .landing-btn--primary {
      background: linear-gradient(135deg, #ffcb4c 0%, #d99911 100%);
      color: #1d1406;
      box-shadow: 0 14px 35px rgba(217, 153, 17, 0.25);
      border-color: rgba(255, 215, 0, 0.4);
    }
    .landing-btn--primary:hover { box-shadow: 0 18px 45px rgba(217, 153, 17, 0.35); background: linear-gradient(135deg, #ffd700 0%, #e6b800 100%); }
    .landing-btn--ghost {
      background: rgba(255, 255, 255, 0.05);
      color: #f7d98b;
      border-color: rgba(255, 215, 0, 0.2);
    }
    .landing-btn--ghost:hover { background: rgba(255, 255, 255, 0.1); color: #ffeb99; }
    .landing-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(255, 215, 0, 0.12);
      border: 1px solid rgba(255, 215, 0, 0.2);
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 12px;
      box-shadow: 0 0 18px rgba(255, 203, 76, 0.1);
    }
    .landing-hero {
      display: grid;
      grid-template-columns: minmax(300px, 390px) minmax(0, 1fr);
      gap: 54px;
      align-items: center;
      background: radial-gradient(circle at top left, rgba(255, 203, 76, 0.08), transparent 24%), radial-gradient(circle at 85% 15%, rgba(255, 215, 0, 0.12), transparent 18%);
      border: 1px solid rgba(255, 203, 76, 0.12);
      box-shadow: inset 0 0 80px rgba(255, 203, 76, 0.08);
    }
      padding: 52px 0 72px;
    }
    .landing-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .landing-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid rgba(255, 194, 62, 0.16);
      background: rgba(255, 186, 41, 0.06);
      border-radius: 999px;
      color: #cfb57a;
      font-size: 12px;
    }
    .landing-hero h1 {
      font-size: clamp(2.5rem, 5vw, 4.7rem);
      line-height: 1.1;
      margin: 0 0 18px;
      color: #f8f3e8;
      font-weight: 900;
      letter-spacing: -1.8px;
    }
    .landing-hero h1 span { color: #f0b332; }
    .landing-hero p {
      max-width: 620px;
      color: #93856a;
      font-size: 16px;
      line-height: 1.95;
      margin: 0 0 28px;
    }
    .landing-hero__cta {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }
    .landing-hero__meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      max-width: 520px;
    }
    .landing-stat strong {
      display: block;
      color: #f3ba3b;
      font-size: 28px;
      line-height: 1;
      margin-bottom: 6px;
    }
    .landing-stat span {
      display: block;
      color: #796c57;
      font-size: 12px;
    }
    .landing-card {
      border: 1px solid rgba(255, 190, 52, 0.35);
      border-radius: 28px;
      background:
        radial-gradient(circle at top center, rgba(44, 240, 177, 0.12), transparent 30%),
        linear-gradient(180deg, rgba(14, 15, 18, 0.96), rgba(10, 10, 12, 0.96));
      padding: 26px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 191, 64, 0.08);
    }
    .landing-card__tag {
      display: inline-flex;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(46, 228, 170, 0.12);
      color: #4ce8b1;
      font-size: 11px;
      margin-bottom: 18px;
    }
    .landing-card__eyebrow {
      color: #7d715d;
      font-size: 12px;
      margin-bottom: 10px;
    }
    .landing-card__gauge {
      width: 100%;
      max-width: 260px;
      margin: 0 auto 6px;
      display: block;
    }
    .landing-card__score {
      text-align: center;
      margin-top: -52px;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    .landing-card__score strong {
      display: block;
      font-size: 44px;
      line-height: 1;
      color: #f7f4ec;
    }
    .landing-card__score span {
      color: #8a7d67;
      font-size: 13px;
    }
    .landing-card__row {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr) 68px;
      gap: 10px;
      align-items: center;
      margin-top: 12px;
      color: #a19277;
      font-size: 12px;
    }
    .landing-card__row strong { color: #f4b63e; }
    .landing-card__row--headline strong { color: #46e1a9; }
    .landing-card__bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .landing-card__bar div {
      height: 100%;
      border-radius: inherit;
    }
    .landing-section {
      padding: 34px 0 76px;
      border-top: 1px solid rgba(255, 194, 62, 0.06);
    }
    .landing-section__head {
      text-align: center;
      max-width: 760px;
      margin: 0 auto 34px;
    }
    .landing-section__head span {
      display: inline-flex;
      margin-bottom: 14px;
      padding: 7px 12px;
      background: rgba(255, 191, 64, 0.08);
      border: 1px solid rgba(255, 191, 64, 0.12);
      color: #c7a55d;
      border-radius: 999px;
      font-size: 11px;
    }
    .landing-section__head h2 {
      margin: 0 0 10px;
      color: #f5f1e7;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.2;
      font-weight: 900;
    }
    .landing-section__head h2 span { color: #efb63b; }
    .landing-section__head p {
      margin: 0;
      color: #867861;
      line-height: 1.9;
      font-size: 15px;
    }
    .landing-steps {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 18px;
      position: relative;
    }
    .landing-steps::before {
      content: '';
      position: absolute;
      top: 29px;
      right: 8%;
      left: 8%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(231, 176, 52, 0.4), transparent);
    }
    .landing-step {
      position: relative;
      text-align: center;
      padding: 0 10px;
    }
    .landing-step__bubble {
      width: 58px;
      height: 58px;
      margin: 0 auto 16px;
      border-radius: 50%;
      border: 1px solid rgba(255, 191, 64, 0.34);
      background: linear-gradient(180deg, rgba(38, 30, 10, 0.9), rgba(12, 12, 12, 0.95));
      color: #f4b53c;
      display: grid;
      place-items: center;
      font-size: 22px;
      font-weight: 800;
    }
    .landing-step h3 {
      margin: 0 0 8px;
      color: #f4efe6;
      font-size: 17px;
      font-weight: 800;
    }
    .landing-step p {
      margin: 0;
      color: #7e715d;
      font-size: 13px;
      line-height: 1.8;
    }
    .landing-model {
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(18, 18, 22, 0.94), rgba(9, 9, 11, 0.96));
      border: 1px solid rgba(255, 191, 64, 0.08);
      padding: 30px;
    }
    .landing-axis-cards {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 22px;
    }
    .landing-axis-card {
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 18px 16px;
      min-height: 148px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 14px;
    }
    .landing-axis-card__icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: 1px solid;
      display: grid;
      place-items: center;
    }
    .landing-axis-card__meta span {
      display: block;
      font-size: 12px;
      margin-bottom: 4px;
      color: #a19376;
    }
    .landing-axis-card__meta strong {
      display: block;
      color: #f8f4eb;
      font-size: 15px;
      margin-bottom: 6px;
    }
    .landing-axis-card__meta small {
      color: #776b58;
      line-height: 1.7;
      display: block;
      font-size: 12px;
    }
    .landing-axis-card__weight {
      font-size: 26px;
      font-weight: 900;
      line-height: 1;
    }
    .landing-axis-table {
      margin-top: 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .landing-axis-row {
      display: grid;
      grid-template-columns: 70px minmax(0, 1fr) 28px;
      align-items: center;
      gap: 16px;
      padding: 15px 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #8c7e68;
      font-size: 14px;
    }
    .landing-axis-row strong {
      color: #f7f2e8;
      font-weight: 700;
    }
    .landing-axis-row em {
      font-style: normal;
      font-weight: 800;
      text-align: center;
    }
    .landing-status {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 22px;
    }
    .landing-status__box {
      border-radius: 18px;
      padding: 18px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 14px;
    }
    .landing-status__box strong {
      display: block;
      font-size: 24px;
      margin-bottom: 6px;
    }
    .landing-status__box--bad { background: rgba(120, 25, 37, 0.32); color: #ff7a8e; }
    .landing-status__box--mid { background: rgba(126, 89, 22, 0.28); color: #ffc35b; }
    .landing-status__box--good { background: rgba(16, 88, 63, 0.28); color: #65efb7; }
    .landing-tracks {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-bottom: 28px;
    }
    .landing-track {
      border-radius: 22px;
      padding: 24px;
      border: 1px solid rgba(255, 190, 52, 0.1);
      background:
        radial-gradient(circle at top right, rgba(255, 190, 52, 0.12), transparent 28%),
        linear-gradient(180deg, rgba(19, 18, 17, 0.95), rgba(11, 11, 12, 0.96));
    }
    .landing-track--blue {
      background:
        radial-gradient(circle at top right, rgba(92, 132, 255, 0.14), transparent 28%),
        linear-gradient(180deg, rgba(19, 21, 31, 0.95), rgba(11, 12, 17, 0.96));
    }
    .landing-track__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: #7b6e5a;
      font-size: 12px;
      margin-bottom: 18px;
    }
    .landing-track__badge {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(255, 191, 64, 0.12);
      color: #f0b53b;
      display: grid;
      place-items: center;
      font-weight: 800;
    }
    .landing-track--blue .landing-track__badge {
      background: rgba(104, 164, 255, 0.14);
      color: #82b7ff;
    }
    .landing-track h3 {
      margin: 0 0 10px;
      color: #f7f2e8;
      font-size: 28px;
      font-weight: 800;
    }
    .landing-track p {
      margin: 0 0 18px;
      color: #897c68;
      line-height: 1.9;
      font-size: 14px;
    }
    .landing-track__chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .landing-track__chips span {
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.03);
      color: #a79778;
      border: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 12px;
    }
    .landing-track button {
      width: 100%;
      border: none;
      border-radius: 14px;
      padding: 14px 18px;
      background: linear-gradient(135deg, #ffcb4c 0%, #d99911 100%);
      color: #1b1408;
      font-family: inherit;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .landing-track--blue button {
      background: rgba(73, 110, 208, 0.24);
      color: #dce7ff;
      border: 1px solid rgba(112, 150, 255, 0.2);
    }
    .landing-compare {
      border-radius: 22px;
      border: 1px solid rgba(255, 191, 64, 0.08);
      overflow: hidden;
      background: rgba(255, 255, 255, 0.02);
    }
    .landing-compare__head,
    .landing-compare__row {
      display: grid;
      grid-template-columns: 120px 120px minmax(0, 1fr);
      align-items: center;
      gap: 16px;
      padding: 16px 22px;
    }
    .landing-compare__head {
      background: rgba(255, 191, 64, 0.04);
      color: #cdae67;
      font-size: 13px;
      font-weight: 700;
    }
    .landing-compare__row {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .landing-compare__row span,
    .landing-compare__row strong {
      text-align: center;
      font-size: 18px;
    }
    .landing-compare__row span { color: #f36c7a; }
    .landing-compare__row strong { color: #60e8b2; }
    .landing-compare__row p {
      margin: 0;
      color: #ebe5d6;
      font-size: 14px;
    }
    .landing-cta {
      text-align: center;
      padding: 86px 24px;
      background:
        radial-gradient(circle at center, rgba(255, 191, 64, 0.16), transparent 26%),
        linear-gradient(180deg, rgba(12, 12, 12, 0.98), rgba(6, 6, 6, 0.98));
    }
    .landing-cta small {
      display: block;
      color: #c7b184;
      font-size: 18px;
      margin-bottom: 12px;
    }
    .landing-cta h2 {
      margin: 0 0 14px;
      font-size: clamp(2.2rem, 5vw, 3.7rem);
      color: #f8f2e7;
      font-weight: 900;
    }
    .landing-cta p {
      max-width: 620px;
      margin: 0 auto 24px;
      color: #8e8066;
      line-height: 1.9;
      font-size: 15px;
    }
    .landing-footer {
      padding: 34px 0 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .landing-footer__grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr 1fr;
      gap: 24px;
      margin-bottom: 22px;
    }
    .landing-footer h4 {
      margin: 0 0 12px;
      color: #f0e4c4;
      font-size: 15px;
    }
    .landing-footer p,
    .landing-footer a {
      display: block;
      margin: 0 0 9px;
      color: #786b57;
      text-decoration: none;
      font-size: 13px;
    }
    .landing-footer__bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      color: #625748;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }
    @media (max-width: 1080px) {
      .landing-links { display: none; }
      .landing-hero,
      .landing-footer__grid { grid-template-columns: 1fr; }
      .landing-axis-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .landing-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 780px) {
      .landing-container { width: min(100% - 20px, 100%); }
      .landing-nav__inner,
      .landing-actions,
      .landing-hero__cta { gap: 10px; }
      .landing-actions { justify-content: flex-start; }
      .landing-hero { padding-top: 28px; gap: 28px; }
      .landing-hero__meta,
      .landing-status,
      .landing-tracks,
      .landing-compare__head,
      .landing-compare__row { grid-template-columns: 1fr; }
      .landing-steps,
      .landing-axis-cards { grid-template-columns: 1fr; }
      .landing-steps::before { display: none; }
      .landing-card,
      .landing-model,
      .landing-track { padding: 20px; }
      .landing-footer__bottom { justify-content: center; text-align: center; }
    }
  </style>
  <div class="landing-shell">
    <nav class="landing-nav">
      <div class="landing-container landing-nav__inner">
        <div class="landing-brand">
          <div class="landing-brand__mark">HX</div>
          <div>
            <strong>HireTX</strong>
            <span>منصة قياس الجاهزية المهنية</span>
          </div>
        </div>
        <div class="landing-links">
          <a href="#hero">ابدأ</a>
          <a href="#how">كيف يعمل</a>
          <a href="#model">النموذج</a>
          <a href="#tracks">المسارات</a>
          <a href="#compare">المقارنة</a>
        </div>
        <div class="landing-actions">
          <button class="landing-btn landing-btn--ghost" onclick="navigate('login')">تسجيل الدخول</button>
          <button class="landing-btn landing-btn--primary" onclick="navigate('register')">ابدأ مجاناً</button>
        </div>
      </div>
    </nav>

    <section class="landing-container landing-hero" id="hero">
      <div class="landing-hero__copy">
        <div class="landing-badges">
          <span class="landing-pill">نموذج تقييم عملي</span>
          <span class="landing-pill">جاهزية لسوق العمل</span>
          <span class="landing-pill">تغذية راجعة مباشرة</span>
        </div>
        <h1>أثبت جاهزيتك <span>الحقيقية</span><br/>للعمل في سوق اليوم</h1>
        <p>منصة HireTX تقدم تقييماً عملياً مبنياً على إطار TBCLM لقياس الجاهزية المهنية بشكل واقعي، مع نتائج واضحة، تحليل موزون، وتوصيات تساعدك على الانتقال من الاستعداد إلى الفرصة.</p>
        <div class="landing-hero__cta">
          <button class="landing-btn landing-btn--primary" onclick="navigate('register')">ابدأ تقييمك <i class="fas fa-arrow-left"></i></button>
          <button class="landing-btn landing-btn--ghost" onclick="navigate('login')">استكشف المنصة</button>
        </div>
        <div class="landing-hero__meta">${statsHTML}</div>
      </div>

      <aside class="landing-card">
        <div class="landing-card__tag">جاهزية مرشحة</div>
        <div class="landing-card__eyebrow">مؤشر الجاهزية المهنية</div>
        <svg class="landing-card__gauge" viewBox="0 0 260 160" fill="none" aria-hidden="true">
          <path d="M40 126C48 75 86 38 130 38C174 38 212 75 220 126" stroke="rgba(255,255,255,0.12)" stroke-width="18" stroke-linecap="round"/>
          <path d="M40 126C48 75 86 38 130 38C174 38 212 75 220 126" stroke="#20df9d" stroke-width="18" stroke-linecap="round" pathLength="100" stroke-dasharray="84 100"/>
        </svg>
        <div class="landing-card__score">
          <strong>84</strong>
          <span>جاهز للعمل</span>
        </div>
        ${readinessHTML}
      </aside>
    </section>

    <section class="landing-section" id="how">
      <div class="landing-container">
        <div class="landing-section__head">
          <span>خطوات بسيطة</span>
          <h2>كيف يعمل <span>HireTX</span></h2>
          <p>تجربة تقييم مصممة لتكون واضحة وسريعة ومهنية منذ التسجيل وحتى استلام التقرير النهائي.</p>
        </div>
        <div class="landing-steps">${stepsHTML}</div>
      </div>
    </section>

    <section class="landing-section" id="model">
      <div class="landing-container">
        <div class="landing-section__head">
          <span>نموذج التقييم</span>
          <h2>نموذج <span>TBCLM</span> للجاهزية المهنية</h2>
          <p>نموذج موزون يجمع بين المهارات الفنية والسلوكية والتحليلية والقيادية والجاهزية لسوق العمل ليمنحك صورة أقرب للحقيقة.</p>
        </div>
        <div class="landing-model">
          <div class="landing-axis-cards">${axesCardsHTML}</div>
          <div class="landing-axis-table">${axesRowsHTML}</div>
          <div class="landing-status">
            <div class="landing-status__box landing-status__box--bad"><strong>0 - 49</strong> يحتاج إلى تطوير</div>
            <div class="landing-status__box landing-status__box--mid"><strong>50 - 74</strong> في طور التحضير</div>
            <div class="landing-status__box landing-status__box--good"><strong>75 - 100</strong> جاهز للعمل</div>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-section" id="tracks">
      <div class="landing-container">
        <div class="landing-section__head">
          <span>المسارات المهنية</span>
          <h2>اختر مسارك <span>المهني</span></h2>
          <p>ابدأ في المسار الأقرب لتخصصك واستلم تقييماً مبنياً على مواقف وظيفية واقعية داخل نفس المجال.</p>
        </div>
        <div class="landing-tracks">${tracksHTML}</div>

        <div class="landing-section__head" id="compare" style="margin-top:14px">
          <h2><span>HireTX</span> مقابل الطرق التقليدية</h2>
        </div>
        <div class="landing-compare">
          <div class="landing-compare__head">
            <span>التقليدي</span>
            <strong>HireTX</strong>
            <p>الميزة</p>
          </div>
          ${comparisonHTML}
        </div>
      </div>
    </section>

    <section class="landing-cta">
      <div class="landing-container">
        <small>DZ</small>
        <h2>جاهز لإثبات قدراتك؟</h2>
        <p>أنشئ حسابك الآن وابدأ أول تقييم عملي داخل HireTX لتحصل على نتيجة واضحة وتقرير يساعدك في خطواتك القادمة.</p>
        <button class="landing-btn landing-btn--primary" onclick="navigate('register')">ابدأ معنا الآن</button>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="landing-container">
        <div class="landing-footer__grid">
          <div>
            <h4>HireTX</h4>
            <p>منصة عربية لقياس الجاهزية المهنية عبر محاكاة واقعية وتقييم موزون يركز على الاستعداد الحقيقي للعمل.</p>
          </div>
          <div>
            <h4>المنصة</h4>
            <a href="#how">كيف تعمل</a>
            <a href="#model">نموذج TBCLM</a>
            <a href="#tracks">المسارات</a>
          </div>
          <div>
            <h4>الوصول</h4>
            <a href="javascript:void(0)" onclick="navigate('login')">تسجيل الدخول</a>
            <a href="javascript:void(0)" onclick="navigate('register')">إنشاء حساب</a>
            <a href="javascript:void(0)" onclick="navigate('login')">نسخة تجريبية</a>
          </div>
          <div>
            <h4>المصادر</h4>
            <p>تقارير جاهزية</p>
            <p>نتائج قابلة للمشاركة</p>
            <p>تحليلات مهنية</p>
          </div>
        </div>
        <div class="landing-footer__bottom">
          <span>© 2026 HireTX. جميع الحقوق محفوظة.</span>
          <span>x2TBCLM v1</span>
        </div>
      </div>
    </footer>
  </div>`;
}

function renderLandingLegacy() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A" class="hero-bg">
    <!-- NAV -->
    <nav style="display:flex;align-items:center;justify-content:space-between;padding:18px 48px;border-bottom:1px solid #111;position:sticky;top:0;z-index:100;background:rgba(10,10,10,0.95);backdrop-filter:blur(10px)">
      <div class="flex items-center gap-3">
        <div class="gold-gradient rounded-lg flex items-center justify-center" style="width:38px;height:38px"><span style="font-weight:900;font-size:15px;color:#000">HX</span></div>
        <div>
          <span style="font-weight:900;font-size:18px;color:#fff;letter-spacing:-0.5px">HireTX</span>
          <span style="font-size:9px;color:#555;letter-spacing:1.5px;text-transform:uppercase;display:block;line-height:1">National Readiness System</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-ghost" onclick="navigate('login')" style="font-size:13px">Sign In</button>
        <button class="btn-gold" onclick="navigate('register')" style="font-size:13px;padding:9px 22px"><i class="fas fa-rocket mr-1"></i>Get Started</button>
      </div>
    </nav>
    <!-- HERO -->
    <div style="padding:90px 48px 60px;text-align:center;max-width:900px;margin:0 auto">
      <div class="status-badge badge-gold inline-flex mb-5" style="font-size:11px;letter-spacing:1px"><i class="fas fa-star mr-1"></i>NATIONAL EMPLOYABILITY READINESS PLATFORM</div>
      <h1 style="font-size:clamp(2.4rem,5vw,4.2rem);font-weight:900;line-height:1.08;letter-spacing:-1.5px;margin-bottom:20px">
        <span style="color:#fff">Measure Your</span><br>
        <span class="gold-text">Employability Readiness</span><br>
        <span style="color:#fff">With Precision</span>
      </h1>
      <p style="font-size:1.1rem;color:#666;max-width:580px;margin:0 auto 36px;line-height:1.7">HireTX uses the TBCLM Framework to assess candidates across 5 critical dimensions — delivering a precise HireTX Index™ that determines career readiness.</p>
      <div class="flex items-center justify-center gap-3 flex-wrap">
        <button class="btn-gold" onclick="navigate('register')" style="font-size:15px;padding:14px 32px"><i class="fas fa-play mr-2"></i>Start Free Assessment</button>
        <button class="btn-outline" onclick="navigate('login')" style="font-size:15px;padding:14px 32px"><i class="fas fa-sign-in-alt mr-2"></i>Sign In</button>
      </div>
    </div>
    <!-- TBCLM CARDS -->
    <div style="padding:0 48px 60px;max-width:1100px;margin:0 auto">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px">
        ${[
          { axis: 'T', name: 'Technical', weight: '30%', icon: 'microchip', color: '#3b82f6', desc: 'Domain knowledge & applied skills' },
          { axis: 'B', name: 'Behavioral', weight: '25%', icon: 'comments', color: '#10b981', desc: 'Communication & professional conduct' },
          { axis: 'C', name: 'Cognitive', weight: '20%', icon: 'brain', color: '#8b5cf6', desc: 'Critical thinking & problem-solving' },
          { axis: 'L', name: 'Leadership', weight: '15%', icon: 'crown', color: '#f59e0b', desc: 'Strategic thinking & accountability' },
          { axis: 'M', name: 'Market', weight: '10%', icon: 'chart-line', color: '#ef4444', desc: 'Industry awareness & readiness' }
        ].map(d => `
        <div class="card-dark" style="padding:20px;text-align:center">
          <div style="width:44px;height:44px;border-radius:10px;background:${d.color}15;border:1px solid ${d.color}30;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
            <i class="fas fa-${d.icon}" style="color:${d.color};font-size:18px"></i>
          </div>
          <div style="font-weight:800;font-size:20px;color:${d.color}">${d.axis}</div>
          <div style="font-weight:700;font-size:13px;color:#eee;margin:2px 0">${d.name}</div>
          <div style="font-size:11px;color:#555;margin-bottom:8px">${d.desc}</div>
          <div style="font-size:22px;font-weight:900;color:#FFD700">${d.weight}</div>
          <div style="font-size:10px;color:#444">weight</div>
        </div>`).join('')}
      </div>
    </div>
    <!-- READINESS LEVELS -->
    <div style="padding:0 48px 60px;max-width:1100px;margin:0 auto">
      <h2 style="text-align:center;font-size:1.6rem;font-weight:800;color:#eee;margin-bottom:28px">HireTX Readiness Levels</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
        ${[
          { range: '90–100', label: 'Ready for Immediate Employment', color: '#10b981', icon: 'check-double', badge: 'ELITE' },
          { range: '75–89', label: 'Professionally Prepared', color: '#3b82f6', icon: 'check-circle', badge: 'PREPARED' },
          { range: '60–74', label: 'Developing Professional', color: '#f59e0b', icon: 'tools', badge: 'DEVELOPING' },
          { range: '<60', label: 'Needs Structured Development', color: '#ef4444', icon: 'book-open', badge: 'FOUNDATIONAL' }
        ].map(r => `
        <div class="card-dark" style="padding:20px">
          <div class="flex items-center gap-3 mb-2">
            <div style="width:36px;height:36px;border-radius:8px;background:${r.color}15;display:flex;align-items:center;justify-content:center">
              <i class="fas fa-${r.icon}" style="color:${r.color}"></i>
            </div>
            <div style="font-size:22px;font-weight:900;color:${r.color}">${r.range}</div>
          </div>
          <div style="font-weight:700;font-size:13px;color:#eee;margin-bottom:4px">${r.label}</div>
          <div class="status-badge" style="background:${r.color}15;color:${r.color};font-size:10px">${r.badge}</div>
        </div>`).join('')}
      </div>
    </div>
    <!-- DEMO CREDENTIALS -->
    <div style="padding:0 48px 80px;max-width:700px;margin:0 auto">
      <div class="card-dark" style="padding:28px;border-color:#2a2200">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-key" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:15px;color:#FFD700">Demo Access</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
          ${[
            { role: 'Candidate (HR)', email: 'candidate@hiretx.gov' },
            { role: 'Candidate (IT)', email: 'john@hiretx.gov' },
            { role: 'Evaluator', email: 'evaluator@hiretx.gov' },
            { role: 'Administrator', email: 'admin@hiretx.gov' }
          ].map(d => `
          <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:12px">
            <div style="font-weight:700;color:#FFD700;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${d.role}</div>
            <div style="color:#888;font-size:11px">${d.email}</div>
            <div style="color:#555;font-size:11px">Pass: <span style="color:#ccc">Password123!</span></div>
          </div>`).join('')}
        </div>
        <button class="btn-gold w-full mt-4" style="justify-content:center" onclick="navigate('login')"><i class="fas fa-sign-in-alt mr-2"></i>Sign In to Demo</button>
      </div>
    </div>
    <!-- FOOTER -->
    <div style="border-top:1px solid #111;padding:20px 48px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:12px;color:#333">© 2026 HireTX National Employability Readiness System</span>
      <div class="flex items-center gap-2">
        <div style="width:6px;height:6px;border-radius:50%;background:#10b981"></div>
        <span style="font-size:11px;color:#444">All Systems Operational</span>
      </div>
    </div>
  </div>`;
}

// ─── LOGIN ──────────────────────────────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;display:flex;align-items:center;justify-content:center;padding:24px" class="hero-bg">
    <div style="width:100%;max-width:420px">
      <div style="text-align:center;margin-bottom:32px">
        <div class="gold-gradient rounded-xl flex items-center justify-center mx-auto mb-4" style="width:52px;height:52px">
          <span style="font-weight:900;font-size:20px;color:#000">HX</span>
        </div>
        <h1 style="font-size:1.8rem;font-weight:900;color:#fff;letter-spacing:-0.5px">HireTX</h1>
        <p style="font-size:13px;color:#555;margin-top:4px">${t('appTagline')}</p>
      </div>
      <div class="card-dark" style="padding:32px">
        <h2 style="font-size:18px;font-weight:700;color:#eee;margin-bottom:24px">${t('signInToAccount')}</h2>
        <div id="login-err" class="notification error" style="display:none;position:relative;top:0;right:0;margin-bottom:16px;max-width:none;animation:none"></div>
        <form onsubmit="doLogin(event)">
          <div style="margin-bottom:16px">
            <label style="font-size:12px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">${t('emailAddress')}</label>
            <input type="email" id="login-email" placeholder="you@example.com" required style="width:100%" autocomplete="email"/>
          </div>
          <div style="margin-bottom:20px">
            <label style="font-size:12px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">${t('password')}</label>
            <div style="position:relative">
              <input type="password" id="login-pass" placeholder="${t('password')}" required style="width:100%;padding-right:42px" autocomplete="current-password"/>
              <button type="button" onclick="togglePw('login-pass','eye-lp')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#666;cursor:pointer"><i id="eye-lp" class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn-gold w-full" style="justify-content:center;font-size:14px;padding:13px" id="login-btn">
            <i class="fas fa-sign-in-alt mr-2"></i>${t('signIn')}
          </button>
        </form>
        <div style="text-align:center;margin-top:20px">
          <span style="font-size:13px;color:#555">${t('dontHaveAccount')} </span>
          <button onclick="navigate('register')" style="background:none;border:none;color:#FFD700;font-size:13px;font-weight:600;cursor:pointer">${t('createAccount')}</button>
        </div>
      </div>
      <div style="text-align:center;margin-top:16px">
        <button onclick="navigate('landing')" style="background:none;border:none;color:#444;font-size:12px;cursor:pointer"><i class="fas fa-arrow-left mr-1"></i>${t('backHome')}</button>
      </div>
    </div>
  </div>`;
}

async function doLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-err');
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  btn.disabled = true;
  btn.innerHTML = `<div class="loading-spinner" style="width:16px;height:16px;margin-right:8px"></div>${t('signingIn')}`;
  errEl.style.display = 'none';
  try {
    const { data } = await API.post('/auth/login', { email, password: pass });
    if (data.success) {
      Auth.save(data.data.token, data.data.user);
      notify(t('welcomeBack', { name: data.data.user.full_name || data.data.user.username }), 'success');
      const role = data.data.user.role;
      if (role === 'evaluator') navigate('evaluator');
      else navigate('dashboard');
    }
  } catch (err) {
    const msg = translateApiMessage(err.response?.data?.message || t('invalidEmailOrPassword'));
    errEl.textContent = msg;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-sign-in-alt mr-2"></i>${t('signIn')}`;
  }
}

// ─── REGISTER ──────────────────────────────────────────────────────────────────
function renderRegister() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;display:flex;align-items:center;justify-content:center;padding:24px" class="hero-bg">
    <div style="width:100%;max-width:460px">
      <div style="text-align:center;margin-bottom:28px">
        <div class="gold-gradient rounded-xl flex items-center justify-center mx-auto mb-3" style="width:48px;height:48px">
          <span style="font-weight:900;font-size:18px;color:#000">HX</span>
        </div>
        <h1 style="font-size:1.6rem;font-weight:900;color:#fff">${t('createYourAccount')}</h1>
        <p style="font-size:13px;color:#555;margin-top:4px">${t('joinPlatform')}</p>
      </div>
      <div class="card-dark" style="padding:32px">
        <div id="reg-err" class="notification error" style="display:none;position:relative;top:0;right:0;margin-bottom:16px;max-width:none;animation:none"></div>
        <form onsubmit="doRegister(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div>
              <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">${t('fullName')}</label>
              <input type="text" id="reg-name" placeholder="Juan Dela Cruz" style="width:100%" required autocomplete="name"/>
            </div>
            <div>
              <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">${t('username')}</label>
              <input type="text" id="reg-user" placeholder="juan_cruz" style="width:100%" required autocomplete="username" minlength="3" maxlength="30"/>
            </div>
          </div>
          <div style="margin-bottom:14px">
            <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">${t('emailAddress')}</label>
            <input type="email" id="reg-email" placeholder="you@example.com" style="width:100%" required autocomplete="email"/>
          </div>
          <div style="margin-bottom:14px">
            <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">${t('specialization')}</label>
            <select id="reg-spec" style="width:100%" required>
              <option value="">${t('selectField')}</option>
              <option value="human_resources">${t('humanResources')} (HR)</option>
              <option value="computer_science">${t('computerScienceIt')}</option>
            </select>
          </div>
          <div style="margin-bottom:20px">
            <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">${t('password')}</label>
            <div style="position:relative">
              <input type="password" id="reg-pass" placeholder="${t('minimum8Characters')}" style="width:100%;padding-right:42px" required minlength="8" autocomplete="new-password"/>
              <button type="button" onclick="togglePw('reg-pass','eye-rp')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#666;cursor:pointer"><i id="eye-rp" class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn-gold w-full" style="justify-content:center;font-size:14px;padding:13px" id="reg-btn">
            <i class="fas fa-user-plus mr-2"></i>${t('createAccount')}
          </button>
        </form>
        <div style="text-align:center;margin-top:18px">
          <span style="font-size:13px;color:#555">${t('alreadyHaveAccount')} </span>
          <button onclick="navigate('login')" style="background:none;border:none;color:#FFD700;font-size:13px;font-weight:600;cursor:pointer">${t('signIn')}</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function doRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('reg-btn');
  const errEl = document.getElementById('reg-err');
  const body = {
    full_name: document.getElementById('reg-name').value.trim(),
    username: document.getElementById('reg-user').value.trim(),
    email: document.getElementById('reg-email').value.trim(),
    specialization: document.getElementById('reg-spec').value,
    password: document.getElementById('reg-pass').value
  };
  if (!body.specialization) { errEl.textContent = t('selectSpecialization'); errEl.style.display = 'block'; return; }
  btn.disabled = true;
  btn.innerHTML = `<div class="loading-spinner" style="width:16px;height:16px;margin-right:8px"></div>${t('creatingAccount')}`;
  errEl.style.display = 'none';
  try {
    const { data } = await API.post('/auth/register', body);
    if (data.success) {
      Auth.save(data.data.token, data.data.user);
      notify(t('accountCreatedWelcome'), 'success');
      navigate('dashboard');
    }
  } catch (err) {
    const msg = translateApiMessage(err.response?.data?.message || t('registerFailed'));
    errEl.textContent = msg;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-user-plus mr-2"></i>${t('createAccount')}`;
  }
}

function togglePw(inputId, iconId) {
  const inp = document.getElementById(inputId);
  const ico = document.getElementById(iconId);
  if (inp.type === 'password') { inp.type = 'text'; ico.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; ico.className = 'fas fa-eye'; }
}

// ─── CANDIDATE DASHBOARD ──────────────────────────────────────────────────────
function renderDashboard() {
  if (Auth.can('admin')) { renderAdminDashboard(); return; }
  renderWithLayout(t('dashboard'), `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadCandidateDashboard();
}

async function loadCandidateDashboard() {
  try {
    const { data } = await API.get('/dashboard/candidate');
    if (!data.success) { notify(t('failedToLoadDashboard'), 'error'); return; }
    const d = data.data;
    State.candidateData = d;
    const tbclm = d.tbclm;
    const stats = d.stats || {};
    const hiretxIdx = tbclm?.hiretx_index || 0;
    const readiness = tbclm?.readiness_level || 'No Data';
    const readinessColor = getReadinessColor(readiness);
    const spec = d.profile?.specialization || 'none';
    const specLabel = specializationLabel(spec);
    const readinessText = readinessLabel(readiness);

    const pc = document.getElementById('page-content');
    if (!pc) return;
    pc.innerHTML = `
    <!-- Stats Row -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px">
      ${statCard('HireTX Index™', hiretxIdx > 0 ? hiretxIdx.toFixed(1) : '—', 'trophy', '#FFD700', readiness)}
      ${statCard('Total Attempts', stats.total || 0, 'play-circle', '#3b82f6', 'simulations taken')}
      ${statCard('Completed', stats.completed || 0, 'check-circle', '#10b981', 'fully scored')}
      ${statCard('In Progress', stats.in_progress || 0, 'clock', '#f59e0b', 'active sessions')}
      ${statCard('Specialization', specLabel.split(' ').slice(0,2).join(' '), 'graduation-cap', '#8b5cf6', specLabel)}
    </div>

    <!-- Index + TBCLM Row -->
    <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;margin-bottom:24px">
      <!-- Index Card -->
      <div class="card-dark" style="padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:11px;font-weight:700;color:#555;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px">HireTX Index™</div>
        ${renderIndexCircle(hiretxIdx, readiness, readinessColor)}
        <div class="status-badge mt-4" style="background:${readinessColor}15;color:${readinessColor};font-size:11px;text-align:center;max-width:200px">${readiness}</div>
        ${tbclm ? `<div style="margin-top:12px;font-size:11px;color:#444">Based on best performance</div>` : `<div style="margin-top:12px;font-size:11px;color:#444">Complete a simulation to see your index</div>`}
      </div>
      <!-- Radar Chart -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">TBCLM Profile</div>
        ${tbclm ? `
        <div class="radar-container" style="max-width:280px;margin:0 auto">
          <canvas id="tbclm-radar" width="280" height="280"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
          ${[['T','Technical','#3b82f6'],[' B','Behavioral','#10b981'],['C','Cognitive','#8b5cf6'],['L','Leadership','#f59e0b'],['M','Market','#ef4444']].map(([k,n,c]) => {
            const key = k.trim();
            const val = tbclm[key] || 0;
            return `<div style="display:flex;align-items:center;gap-8px;gap:8px">
              <span style="font-size:11px;font-weight:700;color:${c};width:16px">${key}</span>
              <div class="axis-bar flex-1" style="background:#1a1a1a"><div class="axis-fill-${key}" style="width:${val}%;height:8px;border-radius:4px;background:${c}"></div></div>
              <span style="font-size:11px;color:#888;width:32px;text-align:right">${val.toFixed(0)}</span>
            </div>`;
          }).join('')}
        </div>` : `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#444;font-size:14px"><i class="fas fa-chart-radar mr-2"></i>No TBCLM data yet</div>`}
      </div>
    </div>

    <!-- Strengths & Weaknesses -->
    ${tbclm && (tbclm.strengths?.length || tbclm.weaknesses?.length) ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <div class="card-dark" style="padding:20px">
        <div class="flex items-center gap-2 mb-3"><i class="fas fa-star" style="color:#FFD700"></i><span style="font-weight:700;font-size:13px;color:#eee">Key Strengths</span></div>
        ${(tbclm.strengths || []).map(s => `<div style="display:flex;gap:8px;margin-bottom:8px"><i class="fas fa-check-circle" style="color:#10b981;margin-top:2px;font-size:12px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${s}</span></div>`).join('') || '<p style="color:#555;font-size:13px">No strengths identified yet</p>'}
      </div>
      <div class="card-dark" style="padding:20px">
        <div class="flex items-center gap-2 mb-3"><i class="fas fa-arrow-up" style="color:#f59e0b"></i><span style="font-weight:700;font-size:13px;color:#eee">Areas for Growth</span></div>
        ${(tbclm.weaknesses || []).map(w => `<div style="display:flex;gap:8px;margin-bottom:8px"><i class="fas fa-exclamation-circle" style="color:#f97316;margin-top:2px;font-size:12px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${w}</span></div>`).join('') || '<p style="color:#555;font-size:13px">No weaknesses identified yet</p>'}
      </div>
    </div>` : ''}

    <!-- Available Simulations -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <i class="fas fa-play-circle" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:15px;color:#eee">Available Simulations</span>
        </div>
        <button class="btn-outline" onclick="navigate('simulations')" style="font-size:12px;padding:7px 16px">View All</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
        ${(d.available_simulations || []).slice(0, 6).map(sim => renderSimCard(sim)).join('') || `<div style="color:#444;font-size:13px;grid-column:1/-1;padding:20px;text-align:center">No simulations available for your specialization</div>`}
      </div>
    </div>

    <!-- Recent Activity -->
    ${(d.recent_submissions || []).length > 0 ? `
    <div class="card-dark" style="padding:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-history" style="color:#FFD700"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Recent Activity</span>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Simulation</th>
            <th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Status</th>
            <th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Score</th>
            <th style="text-align:right;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Date</th>
          </tr></thead>
          <tbody>
            ${(d.recent_submissions || []).map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #111">
              <td style="padding:10px 12px;color:#ccc">${sub.simulation_title || 'Unknown'}<div style="font-size:10px;color:#555;text-transform:capitalize">${(sub.specialization || '').replace('_',' ')} • ${sub.difficulty || ''}</div></td>
              <td style="padding:10px 12px;text-align:center">${statusBadge(sub.status)}</td>
              <td style="padding:10px 12px;text-align:center;font-weight:700;color:${sub.hiretx_index ? '#FFD700' : '#555'}">${sub.hiretx_index ? sub.hiretx_index.toFixed(1) : '—'}</td>
              <td style="padding:10px 12px;text-align:right;color:#555;font-size:11px">${sub.submitted_at ? new Date(sub.submitted_at * 1000).toLocaleDateString() : 'In Progress'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}`;

    // Draw radar chart
    if (tbclm) {
      setTimeout(() => {
        const canvas = document.getElementById('tbclm-radar');
        if (canvas && window.Chart) {
          State.charts.radar = new Chart(canvas, {
            type: 'radar',
            data: {
              labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
              datasets: [{
                label: 'TBCLM Score',
                data: [tbclm.T || 0, tbclm.B || 0, tbclm.C || 0, tbclm.L || 0, tbclm.M || 0],
                backgroundColor: 'rgba(255,215,0,0.08)',
                borderColor: '#FFD700',
                borderWidth: 2,
                pointBackgroundColor: '#FFD700',
                pointRadius: 5
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: { legend: { display: false } },
              scales: {
                r: {
                  min: 0, max: 100,
                  ticks: { stepSize: 25, color: '#444', font: { size: 10 } },
                  grid: { color: '#1e1e1e' },
                  pointLabels: { color: '#888', font: { size: 11 } },
                  angleLines: { color: '#1e1e1e' }
                }
              }
            }
          });
        }
      }, 100);
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><i class="fas fa-exclamation-triangle" style="color:#ef4444;font-size:2rem;margin-bottom:12px"></i><p style="color:#888">Failed to load dashboard. Please refresh.</p></div>`;
  }
}

function renderIndexCircle(idx, readiness, color) {
  const pct = Math.min(100, Math.max(0, idx));
  const r = 66, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return `<div style="position:relative;width:160px;height:160px">
    <svg width="160" height="160" viewBox="0 0 160 160" style="transform:rotate(-90deg)">
      <circle cx="80" cy="80" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="12"/>
      <circle cx="80" cy="80" r="${r}" fill="none" stroke="${color}" stroke-width="12"
        stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
        stroke-linecap="round" class="score-ring"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="font-size:2.2rem;font-weight:900;color:${color};line-height:1">${idx > 0 ? idx.toFixed(1) : '—'}</span>
      <span style="font-size:10px;color:#555;font-weight:600;margin-top:2px">/ 100</span>
    </div>
  </div>`;
}

function statCard(label, value, icon, color, sub) {
  return `<div class="stat-card card-hover">
    <div class="flex items-center justify-between mb-3">
      <div style="width:36px;height:36px;border-radius:8px;background:${color}15;display:flex;align-items:center;justify-content:center">
        <i class="fas fa-${icon}" style="color:${color};font-size:15px"></i>
      </div>
    </div>
    <div style="font-size:1.6rem;font-weight:900;color:#fff;line-height:1.1;margin-bottom:4px">${value}</div>
    <div style="font-size:12px;font-weight:700;color:#888">${label}</div>
    <div style="font-size:10px;color:#555;margin-top:2px">${sub || ''}</div>
  </div>`;
}

function renderSimCard(sim) {
  const diffColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#f97316', expert: '#ef4444' };
  const diffColor = diffColors[sim.difficulty] || '#888';
  const specLabel = sim.specialization === 'human_resources' ? 'HR' : 'IT';
  const mins = Math.round((sim.time_limit || 3600) / 60);
  return `<div class="card-dark card-hover" style="padding:18px;cursor:pointer" onclick="startSimulation('${sim.id}')">
    <div class="flex items-start justify-between mb-3">
      <span class="status-badge" style="background:${diffColor}15;color:${diffColor};font-size:10px;text-transform:capitalize">${sim.difficulty}</span>
      <span class="status-badge badge-blue" style="font-size:10px">${specLabel}</span>
    </div>
    <div style="font-weight:700;font-size:14px;color:#eee;margin-bottom:6px;line-height:1.4">${sim.title}</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${sim.description}</div>
    <div class="flex items-center justify-between">
      <div style="font-size:11px;color:#555"><i class="fas fa-clock mr-1"></i>${mins} min</div>
      <div style="font-size:11px;color:#555"><i class="fas fa-bullseye mr-1"></i>Pass: ${sim.passing_score}%</div>
    </div>
    ${sim.attempt_count > 0 ? `<div class="flex items-center gap-1 mt-2"><i class="fas fa-redo" style="color:#555;font-size:10px"></i><span style="font-size:11px;color:#555">${sim.attempt_count} attempt${sim.attempt_count > 1 ? 's' : ''}</span></div>` : ''}
  </div>`;
}

function getReadinessColor(level) {
  if (!level || level === 'No Data') return '#555';
  if (level.includes('Ready for Immediate')) return '#10b981';
  if (level.includes('Professionally')) return '#3b82f6';
  if (level.includes('Developing')) return '#f59e0b';
  return '#ef4444';
}

function statusBadge(status) {
  const map = {
    in_progress: ['badge-orange', 'In Progress'],
    submitted: ['badge-blue', 'Submitted'],
    under_review: ['badge-purple', 'Under Review'],
    scored: ['badge-green', 'Scored'],
    archived: ['badge-gray', 'Archived']
  };
  const [cls, label] = map[status] || ['badge-gray', status || 'Unknown'];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function renderAdminDashboard() {
  renderWithLayout(Auth.role() === 'super_admin' ? 'Super Admin Dashboard' : 'Admin Dashboard',
    `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadAdminDashboard();
}

async function loadAdminDashboard() {
  try {
    const { data } = await API.get('/dashboard/admin');
    if (!data.success) { notify('Failed to load admin data', 'error'); return; }
    const d = data.data;
    State.adminData = d;
    const stats = d.stats || {};
    const tbclm = d.tbclm_averages || {};
    const pc = document.getElementById('page-content');
    if (!pc) return;
    pc.innerHTML = `
    <!-- Top Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px">
      ${statCard('Total Candidates', stats.total_candidates || 0, 'users', '#3b82f6', 'registered candidates')}
      ${statCard('Active Simulations', stats.active_simulations || 0, 'play-circle', '#10b981', 'published simulations')}
      ${statCard('Total Submissions', stats.total_submissions || 0, 'file-alt', '#8b5cf6', 'all attempts')}
      ${statCard('Pending Reviews', stats.pending_reviews || 0, 'hourglass-half', '#f97316', 'awaiting evaluation')}
      ${statCard('Avg HireTX Index™', stats.avg_hiretx_index ? parseFloat(stats.avg_hiretx_index).toFixed(1) : '—', 'trophy', '#FFD700', 'platform average')}
      ${statCard('Scored Submissions', stats.scored_submissions || 0, 'check-circle', '#10b981', 'fully evaluated')}
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <!-- TBCLM Averages -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Platform TBCLM Averages</div>
        <canvas id="tbclm-bar" height="220"></canvas>
      </div>
      <!-- Readiness Distribution -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Readiness Distribution</div>
        <canvas id="readiness-doughnut" height="220"></canvas>
        <div style="margin-top:12px">
          ${(d.readiness_distribution || []).map(r => `
          <div class="flex items-center justify-between mb-2">
            <span style="font-size:11px;color:#888">${r.readiness_level || 'Unknown'}</span>
            <span style="font-size:12px;font-weight:700;color:#FFD700">${r.count}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Specialization Distribution -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Specialization Distribution</div>
        ${(d.specialization_distribution || []).map(s => `
        <div style="margin-bottom:14px">
          <div class="flex items-center justify-between mb-2">
            <span style="font-size:13px;font-weight:600;color:#ccc">${s.specialization === 'human_resources' ? 'Human Resources' : 'Computer Science / IT'}</span>
            <span style="font-size:12px;font-weight:700;color:#FFD700">${s.count} | Avg: ${s.avg_score ? parseFloat(s.avg_score).toFixed(1) : '—'}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,(s.count/(stats.total_submissions||1))*100).toFixed(0)}%"></div></div>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No data available</p>'}
      </div>
      <!-- Score Distribution -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Score Range Distribution</div>
        <canvas id="score-bar" height="200"></canvas>
      </div>
    </div>

    <!-- Simulation Performance & Recent Users -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <!-- Top Simulations -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center justify-between mb-4">
          <span style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase">Simulation Performance</span>
        </div>
        <div style="overflow:auto;max-height:300px">
          ${(d.simulation_performance || []).slice(0,8).map(sim => `
          <div style="padding:10px 0;border-bottom:1px solid #111">
            <div class="flex items-center justify-between">
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sim.title}</div>
                <div style="font-size:10px;color:#555;text-transform:capitalize">${(sim.specialization||'').replace('_',' ')} • ${sim.difficulty}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px">
                <div style="font-size:13px;font-weight:700;color:#FFD700">${sim.avg_score ? parseFloat(sim.avg_score).toFixed(1) : '—'}</div>
                <div style="font-size:10px;color:#555">${sim.attempt_count} attempts</div>
              </div>
            </div>
          </div>`).join('') || '<p style="color:#555;font-size:13px">No simulation data</p>'}
        </div>
      </div>
      <!-- Recent Users -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center justify-between mb-4">
          <span style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase">Recent Registrations</span>
          <button class="btn-ghost" onclick="navigate('users')" style="font-size:11px;padding:5px 12px">View All</button>
        </div>
        ${(d.recent_users || []).slice(0,6).map(u => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #0d0d0d">
          <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#000;flex-shrink:0">${(u.username||'?')[0].toUpperCase()}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.username}</div>
            <div style="font-size:10px;color:#555;text-transform:capitalize">${(u.role||'').replace('_',' ')} • ${(u.specialization||'').replace('_',' ')}</div>
          </div>
          <span class="status-badge ${u.role === 'admin' ? 'badge-red' : u.role === 'evaluator' ? 'badge-purple' : 'badge-blue'}" style="font-size:10px;text-transform:capitalize;flex-shrink:0">${(u.role||'').replace('_',' ')}</span>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No users registered</p>'}
      </div>
    </div>

    <!-- Audit Log -->
    ${(d.recent_audit || []).length > 0 ? `
    <div class="card-dark" style="padding:24px">
      <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Recent Audit Activity</div>
      <div style="overflow:auto;max-height:250px">
        ${d.recent_audit.map(log => `
        <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #0d0d0d;font-size:12px">
          <span style="color:#555;flex-shrink:0;width:120px">${log.created_at ? new Date(log.created_at * 1000).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}</span>
          <span class="status-badge badge-blue" style="font-size:10px;flex-shrink:0">${log.action}</span>
          <span style="color:#888;flex:1">${log.resource_type || ''} ${log.resource_id ? '· ' + (log.resource_id).slice(0,8) + '...' : ''}</span>
        </div>`).join('')}
      </div>
    </div>` : ''}`;

    // Draw charts
    setTimeout(() => {
      // TBCLM bar
      const tbclmCanvas = document.getElementById('tbclm-bar');
      if (tbclmCanvas && window.Chart) {
        State.charts.tbclmBar = new Chart(tbclmCanvas, {
          type: 'bar',
          data: {
            labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
            datasets: [{
              label: 'Average Score',
              data: [tbclm.avg_T||0, tbclm.avg_B||0, tbclm.avg_C||0, tbclm.avg_L||0, tbclm.avg_M||0],
              backgroundColor: ['rgba(59,130,246,0.7)','rgba(16,185,129,0.7)','rgba(139,92,246,0.7)','rgba(245,158,11,0.7)','rgba(239,68,68,0.7)'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { min: 0, max: 100, grid: { color: '#1a1a1a' }, ticks: { color: '#555' } },
              x: { grid: { display: false }, ticks: { color: '#666', font: { size: 11 } } }
            }
          }
        });
      }
      // Readiness doughnut
      const rdCanvas = document.getElementById('readiness-doughnut');
      if (rdCanvas && window.Chart && (d.readiness_distribution||[]).length > 0) {
        const colors = { 'Ready for Immediate Employment': '#10b981', 'Professionally Prepared': '#3b82f6', 'Developing Professional': '#f59e0b', 'Needs Structured Development': '#ef4444' };
        State.charts.readinessDoughnut = new Chart(rdCanvas, {
          type: 'doughnut',
          data: {
            labels: d.readiness_distribution.map(r => r.readiness_level),
            datasets: [{ data: d.readiness_distribution.map(r => r.count), backgroundColor: d.readiness_distribution.map(r => colors[r.readiness_level] || '#555'), borderWidth: 0 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#666', font: { size: 10 }, boxWidth: 10 } } } }
        });
      }
      // Score distribution bar
      const scoreCanvas = document.getElementById('score-bar');
      if (scoreCanvas && window.Chart) {
        const sd = d.score_distribution || {};
        State.charts.scoreBar = new Chart(scoreCanvas, {
          type: 'bar',
          data: {
            labels: ['90-100\nReady', '75-89\nPrepared', '60-74\nDeveloping', '<60\nNeeds Dev'],
            datasets: [{ label: 'Candidates', data: [sd.range_90_100||0, sd.range_75_89||0, sd.range_60_74||0, sd.range_below_60||0], backgroundColor: ['rgba(16,185,129,0.7)','rgba(59,130,246,0.7)','rgba(245,158,11,0.7)','rgba(239,68,68,0.7)'], borderRadius: 6 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#1a1a1a' }, ticks: { color: '#555' } }, x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10 } } } } }
        });
      }
    }, 100);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><i class="fas fa-exclamation-triangle" style="color:#ef4444;font-size:2rem;margin-bottom:12px"></i><p style="color:#888">Failed to load admin dashboard</p></div>`;
  }
}

// ─── SIMULATIONS LIST ─────────────────────────────────────────────────────────
function renderSimulationsList() {
  renderWithLayout('Simulations', `
  <div style="margin-bottom:20px">
    <div style="font-size:13px;color:#555;margin-bottom:16px">Filter simulations by specialization and difficulty</div>
    <div class="flex items-center gap-3 flex-wrap">
      <select id="filter-spec" onchange="filterAndRenderSims()" style="width:auto;min-width:200px">
        <option value="">All Specializations</option>
        <option value="human_resources">Human Resources</option>
        <option value="computer_science">Computer Science / IT</option>
      </select>
      <select id="filter-diff" onchange="filterAndRenderSims()" style="width:auto;min-width:160px">
        <option value="">All Difficulties</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
        <option value="expert">Expert</option>
      </select>
      <input type="text" id="filter-search" placeholder="Search simulations..." onkeyup="filterAndRenderSims()" style="width:auto;min-width:200px"/>
    </div>
  </div>
  <div id="sims-container"><div class="page-loading"><div class="loading-spinner"></div></div></div>`);
  loadSimulations();
}

async function loadSimulations() {
  try {
    const { data } = await API.get('/simulations?limit=60');
    if (!data.success) { notify('Failed to load simulations', 'error'); return; }
    State.simulations = data.data || [];
    filterAndRenderSims();
  } catch (err) {
    const c = document.getElementById('sims-container');
    if (c) c.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load simulations</p></div>`;
  }
}

function filterAndRenderSims() {
  const spec = document.getElementById('filter-spec')?.value || '';
  const diff = document.getElementById('filter-diff')?.value || '';
  const search = (document.getElementById('filter-search')?.value || '').toLowerCase();
  let filtered = State.simulations;
  if (spec) filtered = filtered.filter(s => s.specialization === spec);
  if (diff) filtered = filtered.filter(s => s.difficulty === diff);
  if (search) filtered = filtered.filter(s => s.title.toLowerCase().includes(search) || s.description.toLowerCase().includes(search));
  const c = document.getElementById('sims-container');
  if (!c) return;
  if (filtered.length === 0) {
    c.innerHTML = `<div class="card-dark" style="padding:40px;text-align:center"><i class="fas fa-search" style="color:#444;font-size:2rem;margin-bottom:12px"></i><p style="color:#555">No simulations found matching your filters</p></div>`;
    return;
  }
  // Group by difficulty
  const groups = { beginner: [], intermediate: [], advanced: [], expert: [] };
  filtered.forEach(s => { if (groups[s.difficulty]) groups[s.difficulty].push(s); });
  const diffLabels = { beginner: { label: 'Beginner', color: '#10b981', icon: 'seedling' }, intermediate: { label: 'Intermediate', color: '#f59e0b', icon: 'layer-group' }, advanced: { label: 'Advanced', color: '#f97316', icon: 'fire' }, expert: { label: 'Expert', color: '#ef4444', icon: 'crown' } };
  let html = '';
  for (const [diff, sims] of Object.entries(groups)) {
    if (sims.length === 0) continue;
    const { label, color, icon } = diffLabels[diff];
    html += `<div style="margin-bottom:28px">
      <div class="flex items-center gap-2 mb-14px" style="margin-bottom:14px">
        <div style="width:30px;height:30px;border-radius:8px;background:${color}15;display:flex;align-items:center;justify-content:center"><i class="fas fa-${icon}" style="color:${color}"></i></div>
        <span style="font-weight:700;font-size:15px;color:${color}">${label}</span>
        <span style="font-size:12px;color:#555">(${sims.length})</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">
        ${sims.map(sim => renderSimCardFull(sim)).join('')}
      </div>
    </div>`;
  }
  c.innerHTML = html;
}

function renderSimCardFull(sim) {
  const diffColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#f97316', expert: '#ef4444' };
  const diffColor = diffColors[sim.difficulty] || '#888';
  const specLabel = sim.specialization === 'human_resources' ? 'Human Resources' : 'Computer Science / IT';
  const mins = Math.round((sim.time_limit || 3600) / 60);
  return `<div class="card-dark card-hover" style="padding:20px">
    <div class="flex items-start justify-between mb-3">
      <span class="status-badge" style="background:${diffColor}15;color:${diffColor};font-size:10px;text-transform:capitalize">${sim.difficulty}</span>
      <span class="status-badge badge-blue" style="font-size:10px">${sim.specialization === 'human_resources' ? 'HR' : 'IT'}</span>
    </div>
    <div style="font-weight:700;font-size:15px;color:#eee;margin-bottom:6px;line-height:1.3">${sim.title}</div>
    <div style="font-size:12px;color:#666;margin-bottom:14px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${sim.description}</div>
    <div style="display:flex;gap:14px;margin-bottom:14px;flex-wrap:wrap">
      <div style="font-size:11px;color:#555"><i class="fas fa-clock mr-1"></i>${mins} min</div>
      <div style="font-size:11px;color:#555"><i class="fas fa-bullseye mr-1"></i>Pass: ${sim.passing_score}%</div>
      <div style="font-size:11px;color:#555"><i class="fas fa-redo mr-1"></i>Max ${sim.max_attempts} attempts</div>
      ${sim.completion_count > 0 ? `<div style="font-size:11px;color:#555"><i class="fas fa-users mr-1"></i>${sim.completion_count} completed</div>` : ''}
    </div>
    <button class="btn-gold w-full" style="justify-content:center;font-size:13px;padding:10px" onclick="startSimulation('${sim.id}')">
      <i class="fas fa-play mr-2"></i>Begin Simulation
    </button>
  </div>`;
}

async function startSimulation(simId) {
  try {
    notify('Loading simulation...', 'info', 2000);
    const [simRes, startRes] = await Promise.all([
      API.get(`/simulations/${simId}`),
      API.post(`/simulations/${simId}/start`)
    ]);
    if (!simRes.data.success || !startRes.data.success) {
      notify(startRes.data?.message || 'Failed to start simulation', 'error'); return;
    }
    const sim = simRes.data.data;
    const { submission_id, attempt_number, is_resume } = startRes.data.data;
    State.sim = {
      active: sim, tasks: sim.tasks || [], currentTaskIdx: 0, responses: {},
      timer: null, startTime: Date.now(), submissionId: submission_id,
      timeLimit: sim.time_limit || 3600, attemptNumber: attempt_number
    };
    if (is_resume) notify('Resuming your previous attempt', 'info');
    navigate('sim_active');
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to start simulation';
    notify(msg, 'error');
  }
}

// ─── ACTIVE SIMULATION ENGINE ──────────────────────────────────────────────────
function renderSimulationActive() {
  const sim = State.sim.active;
  if (!sim) { navigate('simulations'); return; }
  const tasks = State.sim.tasks;
  const total = tasks.length;
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;display:flex;flex-direction:column">
    <!-- Sim Header -->
    <div style="background:#0D0D0D;border-bottom:1px solid #1a1a1a;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100">
      <div class="flex items-center gap-3">
        <div class="gold-gradient rounded-md flex items-center justify-center" style="width:32px;height:32px"><span style="font-weight:900;font-size:12px;color:#000">HX</span></div>
        <div>
          <div style="font-weight:700;font-size:14px;color:#eee;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sim.title}</div>
          <div style="font-size:10px;color:#555">Attempt #${State.sim.attemptNumber || 1} · ${total} Tasks</div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div id="sim-timer" class="sim-timer">--:--</div>
        <button class="btn-danger" onclick="confirmExitSim()" style="font-size:12px;padding:7px 14px"><i class="fas fa-times mr-1"></i>Exit</button>
      </div>
    </div>
    <!-- Progress -->
    <div style="background:#0A0A0A;padding:0 24px 14px;border-bottom:1px solid #111">
      <div class="flex items-center justify-between mb-2">
        <span style="font-size:11px;color:#555">Task <span id="task-progress-label">${State.sim.currentTaskIdx + 1}</span> of ${total}</span>
        <span style="font-size:11px;color:#555" id="answered-count">0 answered</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="sim-progress" style="width:${((State.sim.currentTaskIdx + 1) / total) * 100}%"></div></div>
      <!-- Task Nav -->
      <div class="flex items-center gap-2 mt-3 flex-wrap" id="task-nav">
        ${tasks.map((t, i) => `<div class="task-nav-btn ${i === State.sim.currentTaskIdx ? 'current' : ''}" id="nav-${i}" onclick="gotoTask(${i})">${i + 1}</div>`).join('')}
      </div>
    </div>
    <!-- Task Area -->
    <div style="flex:1;padding:24px;max-width:900px;width:100%;margin:0 auto" id="task-area">
      ${renderCurrentTask()}
    </div>
    <!-- Nav Buttons -->
    <div style="background:#0D0D0D;border-top:1px solid #1a1a1a;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;bottom:0">
      <button class="btn-ghost" onclick="prevTask()" id="prev-btn" style="font-size:13px" ${State.sim.currentTaskIdx === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
        <i class="fas fa-arrow-left mr-2"></i>Previous
      </button>
      <div id="submit-area">
        ${State.sim.currentTaskIdx < total - 1
          ? `<button class="btn-gold" onclick="nextTask()" id="next-btn" style="font-size:13px"><i class="fas fa-arrow-right mr-2"></i>Next Task</button>`
          : `<button class="btn-gold" onclick="confirmSubmitSim()" style="font-size:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff"><i class="fas fa-check mr-2"></i>Submit Simulation</button>`}
      </div>
    </div>
  </div>`;
  startSimTimer();
}

function renderCurrentTask() {
  const tasks = State.sim.tasks;
  const idx = State.sim.currentTaskIdx;
  if (!tasks[idx]) return `<p style="color:#666">No task found</p>`;
  const task = tasks[idx];
  const axisMeta = { T: ['Technical', '#3b82f6'], B: ['Behavioral', '#10b981'], C: ['Cognitive', '#8b5cf6'], L: ['Leadership', '#f59e0b'], M: ['Market', '#ef4444'] };
  const [axisName, axisColor] = axisMeta[task.tbclm_axis] || ['Technical', '#3b82f6'];
  const savedResponse = State.sim.responses[task.id];
  let taskContent = '';
  if (task.task_type === 'multiple_choice') {
    let options = [];
    try { options = JSON.parse(task.options || '[]'); } catch {}
    taskContent = `<div style="display:flex;flex-direction:column;gap:10px" id="mc-options">
      ${options.map((opt, i) => {
        const letter = ['A','B','C','D','E'][i];
        const isSelected = savedResponse === letter;
        return `<label style="display:flex;align-items:flex-start;gap:14px;padding:14px 18px;border-radius:10px;border:1.5px solid ${isSelected ? '#FFD700' : '#1e1e1e'};background:${isSelected ? 'rgba(255,215,0,0.06)' : '#0d0d0d'};cursor:pointer;transition:all 0.2s" onclick="selectMCOption('${task.id}','${letter}',this)">
          <span style="width:28px;height:28px;border-radius:50%;border:1.5px solid ${isSelected ? '#FFD700' : '#333'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:${isSelected ? '#FFD700' : '#666'};flex-shrink:0">${letter}</span>
          <span style="font-size:14px;color:${isSelected ? '#eee' : '#888'};line-height:1.5;padding-top:2px">${opt}</span>
        </label>`;
      }).join('')}
    </div>`;
  } else {
    const wordCount = savedResponse ? savedResponse.split(/\s+/).filter(Boolean).length : 0;
    taskContent = `<div>
      <textarea id="text-response-${task.id}" placeholder="Write your detailed response here...&#10;&#10;• Be specific and use domain terminology&#10;• Structure your response clearly&#10;• Minimum 50 words recommended" rows="10"
        onInput="handleTextInput(event,'${task.id}')"
        style="min-height:220px;font-size:14px;line-height:1.7">${savedResponse || ''}</textarea>
      <div class="flex items-center justify-between mt-2">
        <span style="font-size:11px;color:#555" id="wc-${task.id}">${wordCount} words</span>
        <span style="font-size:11px;color:#555">Min. 50 words recommended for full scoring</span>
      </div>
    </div>`;
  }
  return `<div class="fade-in">
    <!-- Task Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <span class="status-badge" style="background:${axisColor}15;color:${axisColor};font-size:10px;margin-bottom:8px;display:inline-block">${axisName} (${task.tbclm_axis})</span>
        <h2 style="font-size:1.3rem;font-weight:800;color:#eee;line-height:1.3;margin-bottom:8px">${task.title}</h2>
        <p style="font-size:13px;color:#888;line-height:1.6">${task.description}</p>
      </div>
      <div style="flex-shrink:0;margin-left:20px;text-align:center">
        <div style="font-size:18px;font-weight:900;color:#FFD700">${task.max_score}</div>
        <div style="font-size:10px;color:#555">points</div>
      </div>
    </div>
    <!-- Scenario Background if available -->
    ${State.sim.active?.scenario_background ? `
    <div style="background:#0D1A2E;border:1px solid #1a2d4a;border-radius:10px;padding:16px;margin-bottom:20px">
      <div class="flex items-center gap-2 mb-2"><i class="fas fa-info-circle" style="color:#3b82f6;font-size:13px"></i><span style="font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:0.5px">Scenario Context</span></div>
      <p style="font-size:13px;color:#8ab4d4;line-height:1.6">${State.sim.active.scenario_background}</p>
    </div>` : ''}
    <!-- Task Content -->
    ${taskContent}
    <!-- Task Type indicator -->
    <div class="flex items-center gap-2 mt-4" style="border-top:1px solid #111;padding-top:12px">
      <i class="fas fa-${task.task_type === 'multiple_choice' ? 'list' : 'pen-alt'}" style="color:#555;font-size:11px"></i>
      <span style="font-size:11px;color:#555">${task.task_type === 'multiple_choice' ? 'Select the best answer' : task.task_type === 'text_response' ? 'Free text response' : 'Scenario analysis required'}</span>
    </div>
  </div>`;
}

function selectMCOption(taskId, letter, labelEl) {
  State.sim.responses[taskId] = letter;
  document.querySelectorAll('#mc-options label').forEach(l => {
    const span = l.querySelector('span:first-child');
    l.style.border = '1.5px solid #1e1e1e';
    l.style.background = '#0d0d0d';
    if (span) { span.style.borderColor = '#333'; span.style.color = '#666'; }
    const txt = l.querySelector('span:last-child');
    if (txt) txt.style.color = '#888';
  });
  labelEl.style.border = '1.5px solid #FFD700';
  labelEl.style.background = 'rgba(255,215,0,0.06)';
  const span = labelEl.querySelector('span:first-child');
  if (span) { span.style.borderColor = '#FFD700'; span.style.color = '#FFD700'; }
  const txt = labelEl.querySelector('span:last-child');
  if (txt) txt.style.color = '#eee';
  updateTaskNavStatus();
}

function handleTextInput(e, taskId) {
  const val = e.target.value;
  State.sim.responses[taskId] = val;
  const wc = document.getElementById(`wc-${taskId}`);
  if (wc) { const words = val.trim().split(/\s+/).filter(Boolean).length; wc.textContent = `${words} words`; wc.style.color = words >= 50 ? '#10b981' : words >= 20 ? '#f59e0b' : '#555'; }
  updateTaskNavStatus();
}

function updateTaskNavStatus() {
  const tasks = State.sim.tasks;
  let answered = 0;
  tasks.forEach((t, i) => {
    const btn = document.getElementById(`nav-${i}`);
    const hasResponse = !!State.sim.responses[t.id];
    if (hasResponse) answered++;
    if (btn) {
      btn.className = `task-nav-btn ${i === State.sim.currentTaskIdx ? 'current' : hasResponse ? 'answered' : ''}`;
    }
  });
  const ac = document.getElementById('answered-count');
  if (ac) ac.textContent = `${answered} of ${tasks.length} answered`;
}

function gotoTask(idx) {
  saveCurrentTextResponse();
  State.sim.currentTaskIdx = idx;
  const ta = document.getElementById('task-area');
  if (ta) ta.innerHTML = renderCurrentTask();
  updateTaskNavStatus();
  updateSimNavButtons();
  const pl = document.getElementById('task-progress-label');
  if (pl) pl.textContent = idx + 1;
  const prog = document.getElementById('sim-progress');
  if (prog) prog.style.width = `${((idx + 1) / State.sim.tasks.length) * 100}%`;
}

function saveCurrentTextResponse() {
  const tasks = State.sim.tasks;
  const idx = State.sim.currentTaskIdx;
  if (!tasks[idx]) return;
  const task = tasks[idx];
  if (task.task_type !== 'multiple_choice') {
    const ta = document.getElementById(`text-response-${task.id}`);
    if (ta) State.sim.responses[task.id] = ta.value;
  }
}

function nextTask() { saveCurrentTextResponse(); if (State.sim.currentTaskIdx < State.sim.tasks.length - 1) gotoTask(State.sim.currentTaskIdx + 1); }
function prevTask() { saveCurrentTextResponse(); if (State.sim.currentTaskIdx > 0) gotoTask(State.sim.currentTaskIdx - 1); }

function updateSimNavButtons() {
  const total = State.sim.tasks.length;
  const idx = State.sim.currentTaskIdx;
  const prevBtn = document.getElementById('prev-btn');
  const submitArea = document.getElementById('submit-area');
  if (prevBtn) prevBtn.disabled = idx === 0;
  if (submitArea) {
    submitArea.innerHTML = idx < total - 1
      ? `<button class="btn-gold" onclick="nextTask()" style="font-size:13px"><i class="fas fa-arrow-right mr-2"></i>Next Task</button>`
      : `<button class="btn-gold" onclick="confirmSubmitSim()" style="font-size:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff"><i class="fas fa-check mr-2"></i>Submit Simulation</button>`;
  }
}

function startSimTimer() {
  const timeLimit = State.sim.timeLimit * 1000;
  const startTime = Date.now();
  State.sim.timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLimit - elapsed);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const timerEl = document.getElementById('sim-timer');
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      timerEl.className = remaining < 300000 && remaining > 60000 ? 'sim-timer warning' : remaining <= 60000 ? 'sim-timer critical' : 'sim-timer';
    }
    if (remaining <= 0) { clearInterval(State.sim.timer); State.sim.timer = null; autoSubmitSim(); }
  }, 1000);
}

function confirmExitSim() {
  showModal('Exit Simulation', `
    <div style="text-align:center;margin-bottom:20px">
      <i class="fas fa-exclamation-triangle" style="color:#f97316;font-size:2.5rem;margin-bottom:12px"></i>
      <p style="color:#ccc;font-size:14px">Are you sure you want to exit? Your progress will be saved as "In Progress" and you can resume later.</p>
    </div>`,
    [{ label: 'Continue Simulation', class: 'btn-gold', onclick: 'closeModal()' },
     { label: 'Exit Now', class: 'btn-danger', onclick: 'exitSim()' }]);
}

function exitSim() { closeModal(); navigate('simulations'); }

function confirmSubmitSim() {
  saveCurrentTextResponse();
  const total = State.sim.tasks.length;
  const answered = Object.keys(State.sim.responses).filter(id => {
    const r = State.sim.responses[id];
    return r && (typeof r === 'string' ? r.trim().length > 0 : true);
  }).length;
  const unanswered = total - answered;
  showModal('Submit Simulation', `
    <div style="text-align:center;margin-bottom:20px">
      <i class="fas fa-paper-plane" style="color:#FFD700;font-size:2.5rem;margin-bottom:12px"></i>
      <p style="color:#eee;font-size:16px;font-weight:700;margin-bottom:8px">Ready to Submit?</p>
      <p style="color:#888;font-size:13px;margin-bottom:16px">You have answered ${answered} of ${total} tasks.</p>
      ${unanswered > 0 ? `<div class="notification warning" style="position:relative;top:0;right:0;animation:none;margin-bottom:0"><i class="fas fa-exclamation-triangle mr-2"></i>${unanswered} task${unanswered > 1 ? 's' : ''} unanswered. Unanswered tasks will receive 0 points.</div>` : `<div class="notification success" style="position:relative;top:0;right:0;animation:none;margin-bottom:0"><i class="fas fa-check-circle mr-2"></i>All tasks answered!</div>`}
    </div>`,
    [{ label: 'Review Answers', class: 'btn-outline', onclick: 'closeModal()' },
     { label: 'Submit Now', class: 'btn-gold', onclick: 'doSubmitSim()' }]);
}

async function autoSubmitSim() {
  saveCurrentTextResponse();
  notify('Time is up! Auto-submitting...', 'warning');
  await doSubmitSim(true);
}

async function doSubmitSim(isAuto = false) {
  closeModal();
  const simId = State.sim.active?.id;
  const subId = State.sim.submissionId;
  if (!simId || !subId) { notify('Session error. Please restart.', 'error'); return; }
  const timeTaken = Math.floor((Date.now() - State.sim.startTime) / 1000);
  const app = document.getElementById('app');
  if (app) app.innerHTML = `<div style="min-height:100vh;background:#0A0A0A;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px"><div class="loading-spinner" style="width:48px;height:48px;border-width:4px"></div><div style="color:#888;font-size:16px">Scoring your simulation...</div><div style="color:#555;font-size:12px">Please wait, this may take a moment</div></div>`;
  try {
    const { data } = await API.post(`/simulations/${simId}/submit`, {
      submission_id: subId, responses: State.sim.responses, time_taken: timeTaken
    });
    if (data.success) {
      notify('Simulation submitted successfully!', 'success');
      navigate('sim_result', { simResult: data.data });
    } else {
      notify(data.message || 'Submission failed', 'error');
      navigate('simulations');
    }
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to submit simulation', 'error');
    navigate('simulations');
  }
}

// ─── SIMULATION RESULT ────────────────────────────────────────────────────────
function renderSimulationResult() {
  const result = State.simResult;
  if (!result) { navigate('simulations'); return; }
  const hiretxIdx = result.hiretx_index || 0;
  const readiness = result.readiness_level || 'Needs Structured Development';
  const readinessColor = getReadinessColor(readiness);
  const tbclm = result.tbclm_breakdown || {};
  const strengths = result.strengths || [];
  const weaknesses = result.weaknesses || [];
  const recommendations = result.recommendations || [];
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;padding:40px 24px" class="hero-bg">
    <div style="max-width:900px;margin:0 auto">
      <!-- Header -->
      <div style="text-align:center;margin-bottom:40px">
        <div class="gold-gradient rounded-xl flex items-center justify-center mx-auto mb-4" style="width:60px;height:60px"><span style="font-weight:900;font-size:22px;color:#000">HX</span></div>
        <h1 style="font-size:2rem;font-weight:900;color:#fff;margin-bottom:8px">Assessment Complete</h1>
        <p style="color:#666;font-size:14px">${State.sim?.active?.title || 'Simulation'}</p>
      </div>

      <!-- Index Card -->
      <div class="card-dark" style="padding:40px;text-align:center;margin-bottom:28px;border-color:${readinessColor}30">
        <div style="font-size:11px;font-weight:700;color:#555;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:20px">HireTX Index™ Result</div>
        ${renderIndexCircle(hiretxIdx, readiness, readinessColor)}
        <div style="font-size:1rem;font-weight:700;margin-top:16px;padding:8px 20px;display:inline-block;border-radius:20px;background:${readinessColor}15;color:${readinessColor}">${readiness}</div>
        ${result.auto_score !== undefined ? `<div style="margin-top:12px;font-size:13px;color:#555">Auto Score: ${parseFloat(result.auto_score).toFixed(1)}% · Under Review by Evaluator</div>` : ''}
      </div>

      <!-- TBCLM Breakdown -->
      <div class="card-dark" style="padding:28px;margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px">TBCLM Breakdown</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div style="display:flex;flex-direction:column;gap:14px">
            ${[['T','Technical Competency','#3b82f6',0.30],['B','Behavioral Skills','#10b981',0.25],['C','Cognitive Ability','#8b5cf6',0.20]].map(([k,n,c,w]) => `
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span style="font-size:11px;font-weight:800;color:${c};background:${c}15;padding:2px 7px;border-radius:4px">${k}</span>
                  <span style="font-size:12px;color:#aaa">${n}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span style="font-size:12px;font-weight:700;color:${c}">${(tbclm[k]||0).toFixed(1)}</span>
                  <span style="font-size:10px;color:#555">${Math.round(w*100)}%</span>
                </div>
              </div>
              <div class="axis-bar"><div style="width:${tbclm[k]||0}%;height:8px;border-radius:4px;background:${c}"></div></div>
            </div>`).join('')}
          </div>
          <div>
            <canvas id="result-radar" width="250" height="250"></canvas>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;margin-top:14px">
          ${[['L','Leadership & Professionalism','#f59e0b',0.15],['M','Market Readiness','#ef4444',0.10]].map(([k,n,c,w]) => `
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span style="font-size:11px;font-weight:800;color:${c};background:${c}15;padding:2px 7px;border-radius:4px">${k}</span>
                <span style="font-size:12px;color:#aaa">${n}</span>
              </div>
              <div class="flex items-center gap-2">
                <span style="font-size:12px;font-weight:700;color:${c}">${(tbclm[k]||0).toFixed(1)}</span>
                <span style="font-size:10px;color:#555">${Math.round(w*100)}%</span>
              </div>
            </div>
            <div class="axis-bar"><div style="width:${tbclm[k]||0}%;height:8px;border-radius:4px;background:${c}"></div></div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Strengths & Weaknesses -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
        <div class="card-dark" style="padding:24px">
          <div class="flex items-center gap-2 mb-4"><i class="fas fa-star" style="color:#FFD700"></i><span style="font-weight:700;font-size:14px;color:#eee">Key Strengths</span></div>
          ${strengths.length ? strengths.map(s => `<div style="display:flex;gap:8px;margin-bottom:10px"><i class="fas fa-check-circle" style="color:#10b981;font-size:12px;margin-top:3px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${s}</span></div>`).join('') : `<p style="color:#555;font-size:13px">No specific strengths identified</p>`}
        </div>
        <div class="card-dark" style="padding:24px">
          <div class="flex items-center gap-2 mb-4"><i class="fas fa-arrow-trend-up" style="color:#f59e0b"></i><span style="font-weight:700;font-size:14px;color:#eee">Areas for Growth</span></div>
          ${weaknesses.length ? weaknesses.map(w => `<div style="display:flex;gap:8px;margin-bottom:10px"><i class="fas fa-exclamation-circle" style="color:#f97316;font-size:12px;margin-top:3px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${w}</span></div>`).join('') : `<p style="color:#555;font-size:13px">Continue developing all dimensions</p>`}
        </div>
      </div>

      <!-- Recommendations -->
      ${recommendations.length ? `
      <div class="card-dark" style="padding:24px;margin-bottom:24px">
        <div class="flex items-center gap-2 mb-4"><i class="fas fa-lightbulb" style="color:#FFD700"></i><span style="font-weight:700;font-size:14px;color:#eee">Improvement Recommendations</span></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${recommendations.map((r,i) => `
          <div style="display:flex;gap:12px;padding:12px;background:#0d0d0d;border-radius:8px;border:1px solid #1a1a1a">
            <div style="width:24px;height:24px;border-radius:50%;background:#FFD700;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:#000;flex-shrink:0">${i+1}</div>
            <span style="font-size:13px;color:#aaa;line-height:1.5">${r}</span>
          </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Action Buttons -->
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <button class="btn-outline" onclick="navigate('dashboard')"><i class="fas fa-home mr-2"></i>Back to Dashboard</button>
        <button class="btn-outline" onclick="navigate('simulations')"><i class="fas fa-play mr-2"></i>Try Another Simulation</button>
        <button class="btn-gold" onclick="generatePDFReport()" style="font-size:13px"><i class="fas fa-file-pdf mr-2"></i>Download PDF Report</button>
      </div>
    </div>
  </div>`;
  setTimeout(() => {
    const canvas = document.getElementById('result-radar');
    if (canvas && window.Chart) {
      State.charts.resultRadar = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
          datasets: [{ label: 'Your Score', data: [tbclm.T||0, tbclm.B||0, tbclm.C||0, tbclm.L||0, tbclm.M||0], backgroundColor: 'rgba(255,215,0,0.1)', borderColor: '#FFD700', borderWidth: 2, pointBackgroundColor: '#FFD700', pointRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, color: '#333', font: { size: 9 } }, grid: { color: '#1a1a1a' }, pointLabels: { color: '#666', font: { size: 10 } }, angleLines: { color: '#1a1a1a' } } } }
      });
    }
  }, 100);
}

// ─── MODAL HELPERS ────────────────────────────────────────────────────────────
function showModal(title, content, buttons = []) {
  const existing = document.getElementById('app-modal');
  if (existing) existing.remove();
  const btns = buttons.map(b => `<button class="${b.class}" onclick="${b.onclick}" style="font-size:13px;padding:10px 22px">${b.label}</button>`).join('');
  const div = document.createElement('div');
  div.id = 'app-modal';
  div.className = 'modal-overlay';
  div.innerHTML = `<div class="modal-box"><h3 style="font-size:18px;font-weight:800;color:#eee;margin-bottom:16px">${title}</h3>${content}<div class="flex items-center justify-end gap-3 mt-6">${btns}</div></div>`;
  document.body.appendChild(div);
}
function closeModal() { const m = document.getElementById('app-modal'); if (m) m.remove(); }

// ─── EVALUATOR DASHBOARD ─────────────────────────────────────────────────────
function renderEvaluatorDashboard() {
  renderWithLayout('Evaluator – Review Queue', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadEvaluatorDashboard();
}

async function loadEvaluatorDashboard() {
  try {
    const { data } = await API.get('/dashboard/evaluator');
    if (!data.success) { notify('Failed to load evaluator data', 'error'); return; }
    const d = data.data;
    State.evalData = d;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    const pending = d.pending_submissions || [];
    const reviewed = d.reviewed_submissions || [];
    const stats = d.stats || {};
    pc.innerHTML = `
    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px">
      ${statCard('Pending Review', pending.length, 'hourglass-half', '#f97316', 'awaiting your review')}
      ${statCard('Reviewed', stats.total_reviewed || 0, 'check-double', '#10b981', 'by you')}
      ${statCard('Avg Score Given', stats.avg_score ? parseFloat(stats.avg_score).toFixed(1) : '—', 'star', '#FFD700', 'your evaluation average')}
    </div>

    <!-- Pending Queue -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-inbox" style="color:#f97316"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Pending Submissions</span>
        ${pending.length > 0 ? `<span class="status-badge badge-orange" style="font-size:11px">${pending.length}</span>` : ''}
      </div>
      ${pending.length === 0 ? `<div style="text-align:center;padding:32px;color:#555"><i class="fas fa-check-circle" style="font-size:2rem;margin-bottom:12px;color:#10b981"></i><p>All submissions reviewed! Great work.</p></div>` : `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Candidate</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Simulation</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Auto Score</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Status</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Submitted</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Action</th>
          </tr></thead>
          <tbody>
            ${pending.map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #111">
              <td style="padding:10px 12px;color:#ccc">${sub.candidate_name || sub.candidate_username || 'Unknown'}</td>
              <td style="padding:10px 12px"><div style="color:#ccc;font-size:13px">${sub.simulation_title || 'Unknown'}</div><div style="font-size:10px;color:#555;text-transform:capitalize">${(sub.specialization||'').replace('_',' ')} • ${sub.difficulty||''}</div></td>
              <td style="padding:10px 12px;text-align:center;font-weight:700;color:#FFD700">${sub.auto_score ? parseFloat(sub.auto_score).toFixed(1) : '—'}</td>
              <td style="padding:10px 12px;text-align:center">${statusBadge(sub.status)}</td>
              <td style="padding:10px 12px;text-align:center;font-size:11px;color:#555">${sub.submitted_at ? new Date(sub.submitted_at*1000).toLocaleDateString() : '—'}</td>
              <td style="padding:10px 12px;text-align:center"><button class="btn-gold" style="font-size:12px;padding:7px 16px" onclick="openEvaluation('${sub.id}')"><i class="fas fa-edit mr-1"></i>Review</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>

    <!-- Recently Reviewed -->
    ${reviewed.length > 0 ? `
    <div class="card-dark" style="padding:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-history" style="color:#888"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Recently Reviewed</span>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Candidate</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Simulation</th>
            <th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Final Score</th>
            <th style="text-align:right;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Reviewed</th>
          </tr></thead>
          <tbody>
            ${reviewed.slice(0,8).map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #0d0d0d">
              <td style="padding:8px 12px;color:#999">${sub.candidate_name || sub.candidate_username || 'Unknown'}</td>
              <td style="padding:8px 12px;color:#999;font-size:12px">${sub.simulation_title || 'Unknown'}</td>
              <td style="padding:8px 12px;text-align:center;font-weight:700;color:#10b981">${sub.final_score ? parseFloat(sub.final_score).toFixed(1) : sub.evaluator_score ? parseFloat(sub.evaluator_score).toFixed(1) : '—'}</td>
              <td style="padding:8px 12px;text-align:right;font-size:11px;color:#555">${sub.reviewed_at ? new Date(sub.reviewed_at*1000).toLocaleDateString() : '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}`;
  } catch (err) {
    console.error('Evaluator dashboard error:', err);
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load evaluator dashboard</p></div>`;
  }
}

async function openEvaluation(submissionId) {
  try {
    notify('Loading submission...', 'info', 2000);
    const { data } = await API.get(`/dashboard/submission/${submissionId}`);
    if (!data.success) { notify('Failed to load submission', 'error'); return; }
    State.evalSubmission = data.data;
    navigate('evaluate');
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to load submission', 'error');
  }
}

// ─── EVALUATION PANEL ────────────────────────────────────────────────────────
function renderEvaluationPanel() {
  const sub = State.evalSubmission;
  if (!sub) { navigate('evaluator'); return; }
  const submission = sub.submission || sub;
  const tasks = sub.tasks || [];
  const scores = sub.scores || [];
  const scoreMap = {};
  scores.forEach(s => { scoreMap[s.task_id] = s; });
  const responses = typeof submission.responses === 'string' ? JSON.parse(submission.responses || '{}') : (submission.responses || {});
  const autoScore = submission.auto_score;
  const hiretxIdx = submission.hiretx_index;
  const tbclm = submission.tbclm_breakdown ? (typeof submission.tbclm_breakdown === 'string' ? JSON.parse(submission.tbclm_breakdown) : submission.tbclm_breakdown) : {};
  renderWithLayout(`Evaluate: ${sub.simulation?.title || 'Submission'}`, `
  <div style="display:grid;grid-template-columns:1fr 360px;gap:20px">
    <!-- Tasks & Responses -->
    <div>
      <div class="card-dark" style="padding:20px;margin-bottom:20px">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div style="font-size:15px;font-weight:700;color:#eee">${sub.simulation?.title || 'Simulation'}</div>
            <div style="font-size:12px;color:#555">${(sub.simulation?.specialization||'').replace('_',' ')} • ${sub.simulation?.difficulty || ''}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#555">Candidate</div>
            <div style="font-size:14px;font-weight:700;color:#eee">${sub.candidate?.full_name || sub.candidate?.username || 'Unknown'}</div>
            <div style="font-size:11px;color:#555">${sub.candidate?.email || ''}</div>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div style="font-size:12px;color:#555">Auto Score: <span style="color:#FFD700;font-weight:700">${autoScore ? parseFloat(autoScore).toFixed(1) + '%' : '—'}</span></div>
          ${hiretxIdx ? `<div style="font-size:12px;color:#555">HireTX Index: <span style="color:#FFD700;font-weight:700">${parseFloat(hiretxIdx).toFixed(1)}</span></div>` : ''}
          <div style="font-size:12px;color:#555">Submitted: <span style="color:#888">${submission.submitted_at ? new Date(submission.submitted_at*1000).toLocaleDateString() : '—'}</span></div>
        </div>
      </div>
      <!-- Task Responses -->
      <div id="task-responses">
        ${tasks.map((task, idx) => {
          const response = responses[task.id];
          const taskScore = scoreMap[task.id];
          const axisColors = { T: '#3b82f6', B: '#10b981', C: '#8b5cf6', L: '#f59e0b', M: '#ef4444' };
          const axisColor = axisColors[task.tbclm_axis] || '#888';
          const autoTaskScore = taskScore?.raw_score || 0;
          return `<div class="card-dark" style="padding:20px;margin-bottom:14px" id="task-card-${task.id}">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span style="font-size:10px;font-weight:700;color:${axisColor};background:${axisColor}15;padding:2px 8px;border-radius:4px">${task.tbclm_axis}</span>
                  <span style="font-size:10px;color:#555">Task ${idx+1}</span>
                </div>
                <div style="font-weight:700;font-size:14px;color:#eee">${task.title}</div>
                <div style="font-size:12px;color:#666;margin-top:2px">${task.description}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px">
                <div style="font-size:11px;color:#555">Auto: <span style="color:#FFD700;font-weight:700">${autoTaskScore.toFixed(1)}</span>/${task.max_score}</div>
              </div>
            </div>
            ${response ? `
            <div style="background:#0D0D0D;border:1px solid #1a1a1a;border-radius:8px;padding:14px;margin-bottom:12px;max-height:200px;overflow-y:auto">
              <div style="font-size:10px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Candidate Response</div>
              <div style="font-size:13px;color:#aaa;line-height:1.7;white-space:pre-wrap">${typeof response === 'string' ? response : JSON.stringify(response)}</div>
            </div>` : `<div style="background:#0d0d0d;padding:12px;border-radius:8px;margin-bottom:12px"><span style="font-size:12px;color:#555">No response submitted for this task</span></div>`}
            <!-- Evaluator Score Input -->
            <div class="flex items-center gap-12px" style="gap:12px">
              <div style="flex:1">
                <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Evaluator Score (0-${task.max_score})</label>
                <input type="number" min="0" max="${task.max_score}" placeholder="${autoTaskScore.toFixed(0)}" id="score-${task.id}" style="width:100%" value="${autoTaskScore.toFixed(0)}"/>
              </div>
              <div style="flex:2">
                <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Notes (optional)</label>
                <input type="text" placeholder="Add scoring notes..." id="notes-${task.id}" style="width:100%"/>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <!-- Scoring Panel -->
    <div>
      <div class="card-dark" style="padding:24px;position:sticky;top:80px">
        <div style="font-size:13px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Scoring Panel</div>
        <!-- TBCLM Auto Scores -->
        ${Object.keys(tbclm).length > 0 ? `
        <div style="margin-bottom:20px">
          <div style="font-size:11px;font-weight:700;color:#555;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Auto TBCLM Scores</div>
          ${[['T','Technical','#3b82f6'],['B','Behavioral','#10b981'],['C','Cognitive','#8b5cf6'],['L','Leadership','#f59e0b'],['M','Market','#ef4444']].map(([k,n,c]) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:700;color:${c};width:14px">${k}</span>
            <div class="axis-bar flex-1" style="background:#1a1a1a"><div style="width:${tbclm[k]||0}%;height:6px;border-radius:3px;background:${c}"></div></div>
            <span style="font-size:11px;font-weight:700;color:${c};width:30px;text-align:right">${(tbclm[k]||0).toFixed(1)}</span>
          </div>`).join('')}
        </div>` : ''}
        <!-- Final Score Override -->
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:700;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Override Final Score (0-100)</label>
          <input type="number" min="0" max="100" id="final-score-override" placeholder="${autoScore ? parseFloat(autoScore).toFixed(1) : 'Auto-calculated'}" style="width:100%"/>
          <div style="font-size:10px;color:#555;margin-top:4px">Leave blank to use auto-calculated score</div>
        </div>
        <!-- Evaluator Notes -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:700;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">General Evaluation Notes</label>
          <textarea id="eval-notes" rows="4" placeholder="Overall assessment, qualitative observations, and recommendations..."></textarea>
        </div>
        <button class="btn-gold w-full" style="justify-content:center;font-size:14px;margin-bottom:10px" onclick="submitEvaluation('${submission.id}','${tasks.map(t => t.id).join(',')}')">
          <i class="fas fa-check mr-2"></i>Submit Evaluation
        </button>
        <button class="btn-ghost w-full" style="justify-content:center;font-size:13px" onclick="navigate('evaluator')">
          <i class="fas fa-arrow-left mr-2"></i>Back to Queue
        </button>
      </div>
    </div>
  </div>`);
}

async function submitEvaluation(submissionId, taskIdsStr) {
  const taskIds = taskIdsStr.split(',').filter(Boolean);
  const tasks = State.evalSubmission?.tasks || [];
  const taskScores = tasks.map(task => ({
    task_id: task.id,
    score: parseFloat(document.getElementById(`score-${task.id}`)?.value || 0),
    max_score: task.max_score,
    notes: document.getElementById(`notes-${task.id}`)?.value || null
  }));
  const overrideVal = document.getElementById('final-score-override')?.value;
  const evaluatorScore = overrideVal ? parseFloat(overrideVal) : undefined;
  const evaluatorNotes = document.getElementById('eval-notes')?.value || null;
  try {
    const { data } = await API.post(`/dashboard/submission/${submissionId}/score`, {
      task_scores: taskScores,
      evaluator_score: evaluatorScore,
      evaluator_notes: evaluatorNotes
    });
    if (data.success) {
      notify('Evaluation submitted successfully!', 'success');
      navigate('evaluator');
    } else {
      notify(data.message || 'Failed to submit evaluation', 'error');
    }
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to submit evaluation', 'error');
  }
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function renderAnalytics() {
  renderWithLayout('Analytics & Insights', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadAnalytics();
}

async function loadAnalytics() {
  try {
    const { data } = await API.get('/dashboard/analytics');
    if (!data.success) { notify('Failed to load analytics', 'error'); return; }
    const d = data.data;
    State.analyticsData = d;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    const skillGaps = d.skill_gaps || [];
    const trending = d.trending_simulations || [];
    const topPerformers = d.top_performers || [];
    pc.innerHTML = `
    <!-- Skill Gap Analysis -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-exclamation-triangle" style="color:#f59e0b"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Skill Gap Analysis by Specialization</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        ${skillGaps.map(sg => {
          const axes = { T: sg.avg_T||0, B: sg.avg_B||0, C: sg.avg_C||0, L: sg.avg_L||0, M: sg.avg_M||0 };
          const minAxis = Object.entries(axes).sort((a,b) => a[1]-b[1])[0];
          const axisColors = { T: '#3b82f6', B: '#10b981', C: '#8b5cf6', L: '#f59e0b', M: '#ef4444' };
          return `<div>
            <div style="font-weight:700;font-size:14px;color:#eee;margin-bottom:12px">${sg.specialization === 'human_resources' ? 'Human Resources' : 'Computer Science / IT'}<span style="font-size:11px;color:#555;margin-left:8px">(${sg.sample_size} submissions)</span></div>
            ${Object.entries(axes).map(([k,v]) => {
              const c = axisColors[k];
              const axisNames = { T:'Technical', B:'Behavioral', C:'Cognitive', L:'Leadership', M:'Market' };
              return `<div style="margin-bottom:10px">
                <div class="flex items-center justify-between mb-1">
                  <span style="font-size:12px;color:${v < 60 ? c : '#888'};font-weight:${v < 60 ? '700' : '400'}">${axisNames[k]}</span>
                  <span style="font-size:12px;font-weight:700;color:${v < 60 ? '#ef4444' : v < 75 ? '#f59e0b' : '#10b981'}">${v.toFixed(1)}${v < 60 ? ' ⚠' : ''}</span>
                </div>
                <div class="axis-bar"><div style="width:${v}%;height:8px;border-radius:4px;background:${v < 60 ? '#ef4444' : v < 75 ? '#f59e0b' : c}"></div></div>
              </div>`;
            }).join('')}
            ${minAxis ? `<div style="margin-top:8px;padding:8px 12px;background:#2d1700;border:1px solid #f59e0b30;border-radius:6px;font-size:11px;color:#f59e0b"><i class="fas fa-exclamation-triangle mr-1"></i>Weakest dimension: <strong>${['Technical','Behavioral','Cognitive','Leadership','Market'][['T','B','C','L','M'].indexOf(minAxis[0])]}</strong> (${minAxis[1].toFixed(1)})</div>` : ''}
          </div>`;
        }).join('') || '<p style="color:#555;font-size:13px;grid-column:1/-1">No skill gap data available yet</p>'}
      </div>
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <!-- Trending Simulations -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-fire" style="color:#f97316"></i>
          <span style="font-weight:700;font-size:14px;color:#eee">Trending Simulations</span>
        </div>
        ${trending.slice(0,6).map((t,i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #0d0d0d">
          <div style="width:24px;height:24px;border-radius:50%;background:rgba(249,115,22,0.15);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#f97316;flex-shrink:0">${i+1}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</div>
            <div style="font-size:10px;color:#555">${t.submissions_count} submissions</div>
          </div>
          <div style="font-size:13px;font-weight:700;color:#FFD700;flex-shrink:0">${t.avg_score ? parseFloat(t.avg_score).toFixed(1) : '—'}</div>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No trending data yet</p>'}
      </div>
      <!-- Top Performers -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-trophy" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:14px;color:#eee">Top Performers</span>
        </div>
        ${topPerformers.slice(0,6).map((p,i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #0d0d0d">
          <div style="width:28px;height:28px;border-radius:50%;background:${i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#1a1a1a'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:${i<3?'#000':'#666'};flex-shrink:0">${i+1}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;color:#ccc">${p.username || 'Unknown'}</div>
            <div style="font-size:10px;color:#555;text-transform:capitalize">${(p.specialization||'').replace('_',' ')}</div>
          </div>
          <div style="font-size:14px;font-weight:800;color:#FFD700;flex-shrink:0">${p.best_score ? parseFloat(p.best_score).toFixed(1) : '—'}</div>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No performer data yet</p>'}
      </div>
    </div>

    <!-- Readiness Trends -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-chart-line" style="color:#3b82f6"></i>
        <span style="font-weight:700;font-size:14px;color:#eee">Readiness Trends (30 days)</span>
      </div>
      <canvas id="readiness-trend-chart" height="160"></canvas>
    </div>`;

    // Draw trend chart
    setTimeout(() => {
      const canvas = document.getElementById('readiness-trend-chart');
      if (canvas && window.Chart) {
        const trends = d.readiness_trends || [];
        State.charts.trendLine = new Chart(canvas, {
          type: 'line',
          data: {
            labels: trends.map(t => t.date || ''),
            datasets: [{
              label: 'Avg HireTX Index',
              data: trends.map(t => t.avg_score || 0),
              borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.06)',
              borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#FFD700'
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { min: 0, max: 100, grid: { color: '#1a1a1a' }, ticks: { color: '#555' } },
              x: { grid: { display: false }, ticks: { color: '#555', maxTicksLimit: 10 } }
            }
          }
        });
      }
    }, 100);
  } catch (err) {
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load analytics</p></div>`;
  }
}

// ─── USERS ────────────────────────────────────────────────────────────────────
function renderUsers() {
  renderWithLayout('User Management', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadUsers();
}

async function loadUsers(page = 1, role = '', search = '') {
  try {
    const params = new URLSearchParams({ page, limit: 20 });
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const { data } = await API.get(`/dashboard/users?${params}`);
    if (!data.success) { notify('Failed to load users', 'error'); return; }
    const users = data.data || [];
    State.usersData = users;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    pc.innerHTML = `
    <!-- Filters -->
    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <input type="text" id="user-search" placeholder="Search by username or email..." style="min-width:220px" onkeyup="handleUserSearch(this.value)"/>
      <select id="user-role-filter" onchange="loadUsers(1,this.value,document.getElementById('user-search')?.value||'')" style="width:auto;min-width:160px">
        <option value="">All Roles</option>
        <option value="candidate">Candidates</option>
        <option value="evaluator">Evaluators</option>
        <option value="admin">Admins</option>
      </select>
    </div>
    <div class="card-dark" style="padding:24px">
      <div class="flex items-center justify-between mb-4">
        <span style="font-weight:700;font-size:15px;color:#eee">All Users</span>
        <span style="font-size:12px;color:#555">${users.length} users loaded</span>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">User</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Email</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Role</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Specialization</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Status</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Actions</th>
          </tr></thead>
          <tbody>
            ${users.map(u => `
            <tr class="table-row" style="border-bottom:1px solid #111">
              <td style="padding:10px 12px">
                <div class="flex items-center gap-2">
                  <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#000;flex-shrink:0">${(u.username||'?')[0].toUpperCase()}</div>
                  <div>
                    <div style="color:#ccc;font-weight:600">${u.full_name || u.username}</div>
                    <div style="color:#555;font-size:11px">@${u.username}</div>
                  </div>
                </div>
              </td>
              <td style="padding:10px 12px;color:#888;font-size:12px">${u.email}</td>
              <td style="padding:10px 12px;text-align:center"><span class="status-badge ${u.role==='super_admin'?'badge-red':u.role==='admin'?'badge-orange':u.role==='evaluator'?'badge-purple':'badge-blue'}" style="text-transform:capitalize;font-size:10px">${(u.role||'').replace('_',' ')}</span></td>
              <td style="padding:10px 12px;text-align:center;font-size:12px;color:#888;text-transform:capitalize">${(u.specialization||'none').replace('_',' ')}</td>
              <td style="padding:10px 12px;text-align:center"><span class="status-badge ${u.is_active?'badge-green':'badge-gray'}">${u.is_active?'Active':'Inactive'}</span></td>
              <td style="padding:10px 12px;text-align:center">
                ${u.id !== State.user?.id ? `<select onchange="changeUserRole('${u.id}',this.value)" style="width:auto;font-size:11px;padding:5px 8px">
                  <option value="">Change Role</option>
                  <option value="candidate" ${u.role==='candidate'?'selected':''}>Candidate</option>
                  <option value="evaluator" ${u.role==='evaluator'?'selected':''}>Evaluator</option>
                  <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                </select>` : `<span style="font-size:11px;color:#444">You</span>`}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (err) {
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load users</p></div>`;
  }
}

async function changeUserRole(userId, newRole) {
  if (!newRole) return;
  try {
    const { data } = await API.put(`/dashboard/users/${userId}/role`, { role: newRole });
    if (data.success) {
      notify(`Role updated successfully`, 'success');
      loadUsers();
    } else notify(data.message || 'Failed to update role', 'error');
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to update role', 'error');
  }
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function renderReports() {
  renderWithLayout('Reports & Performance', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadReports();
}

async function loadReports() {
  try {
    // Always use the report endpoint which provides consistent data structure
    const { data } = await API.get(`/dashboard/report/${State.user.id}`);
    if (!data.success) { notify('Failed to load report data', 'error'); return; }
    const d = data.data;
    State.reportData = d;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    const tbclm = d.best_result;
    const submissions = d.submission_history || [];
    pc.innerHTML = `
    <!-- Report Header -->
    <div class="card-dark" style="padding:28px;margin-bottom:24px;background:linear-gradient(135deg,#111 0%,#1a1500 100%);border-color:#2a2000">
      <div class="flex items-center gap-4">
        <div class="gold-gradient rounded-xl flex items-center justify-center" style="width:64px;height:64px;flex-shrink:0">
          <span style="font-weight:900;font-size:24px;color:#000">HX</span>
        </div>
        <div style="flex:1">
          <div style="font-size:18px;font-weight:900;color:#fff">${d.profile?.full_name || d.profile?.username || State.user?.full_name || State.user?.username}</div>
          <div style="font-size:13px;color:#888;text-transform:capitalize">${(d.profile?.specialization || State.user?.specialization || 'none').replace('_', ' ')}</div>
          <div style="font-size:11px;color:#555;margin-top:2px">Candidate ID: ${d.profile?.id || State.user?.id || 'N/A'}</div>
        </div>
        <div style="text-align:right">
          ${tbclm ? `
          <div style="font-size:3rem;font-weight:900;color:#FFD700;line-height:1">${parseFloat(tbclm.hiretx_index||0).toFixed(1)}</div>
          <div style="font-size:11px;color:#888;margin-bottom:4px">HireTX Index™</div>
          <div class="status-badge" style="background:${getReadinessColor(tbclm.readiness_level)}15;color:${getReadinessColor(tbclm.readiness_level)};font-size:10px">${tbclm.readiness_level || 'Unrated'}</div>` : `<div style="color:#555;font-size:14px">No completed assessments</div>`}
        </div>
      </div>
    </div>

        ${tbclm ? `
    <!-- TBCLM Profile -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">TBCLM Profile</div>
        <canvas id="report-radar" width="250" height="250"></canvas>
      </div>
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Dimension Scores</div>
        ${[['T','Technical Competency','#3b82f6',30],['B','Behavioral Skills','#10b981',25],['C','Cognitive Ability','#8b5cf6',20],['L','Leadership','#f59e0b',15],['M','Market Readiness','#ef4444',10]].map(([k,n,c,w]) => `
        <div style="margin-bottom:14px">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span style="font-size:11px;font-weight:800;color:${c};background:${c}15;padding:2px 7px;border-radius:4px;width:20px;text-align:center">${k}</span>
              <span style="font-size:12px;color:#aaa">${n}</span>
            </div>
            <div class="flex items-center gap-2">
              <span style="font-size:13px;font-weight:700;color:${c}">${(tbclm[k]||tbclm[k+'_score']||tbclm[k.toLowerCase()+'_score']||0).toFixed(1)}</span>
              <span style="font-size:10px;color:#444">${w}%</span>
            </div>
          </div>
          <div class="axis-bar"><div style="width:${tbclm[k]||tbclm[k+'_score']||tbclm[k.toLowerCase()+'_score']||0}%;height:8px;border-radius:4px;background:${c}"></div></div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Submission History -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <i class="fas fa-history" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:15px;color:#eee">Assessment History</span>
        </div>
        <button class="btn-gold" onclick="generatePDFReport()" style="font-size:13px;padding:9px 20px"><i class="fas fa-file-pdf mr-2"></i>Export PDF</button>
      </div>
      ${submissions.length > 0 ? `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Simulation</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Status</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">HireTX Index</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Readiness</th>
            <th style="text-align:right;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Date</th>
          </tr></thead>
          <tbody>
            ${submissions.map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #0d0d0d">
              <td style="padding:10px 12px"><div style="color:#ccc">${sub.simulation_title || sub.title || 'Unknown'}</div><div style="font-size:10px;color:#555;text-transform:capitalize">${(sub.specialization||'').replace('_',' ')}</div></td>
              <td style="padding:10px 12px;text-align:center">${statusBadge(sub.status)}</td>
              <td style="padding:10px 12px;text-align:center;font-weight:800;font-size:15px;color:${sub.hiretx_index?'#FFD700':'#555'}">${sub.hiretx_index?parseFloat(sub.hiretx_index).toFixed(1):'—'}</td>
              <td style="padding:10px 12px;text-align:center"><span style="font-size:11px;color:${getReadinessColor(sub.readiness_level)}">${sub.readiness_level||'—'}</span></td>
              <td style="padding:10px 12px;text-align:right;font-size:11px;color:#555">${sub.submitted_at?new Date(sub.submitted_at*1000).toLocaleDateString():'—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div style="text-align:center;padding:40px;color:#555"><i class="fas fa-clipboard" style="font-size:2rem;margin-bottom:12px"></i><p>No assessments completed yet. Start a simulation to build your report.</p></div>`}
    </div>`;

    // Radar chart
    if (tbclm) {
      setTimeout(() => {
        const canvas = document.getElementById('report-radar');
        if (canvas && window.Chart) {
          State.charts.reportRadar = new Chart(canvas, {
            type: 'radar',
            data: {
              labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
              datasets: [{ data: [tbclm.T||tbclm.t_score||0, tbclm.B||tbclm.b_score||0, tbclm.C||tbclm.c_score||0, tbclm.L||tbclm.l_score||0, tbclm.M||tbclm.m_score||0], backgroundColor: 'rgba(255,215,0,0.1)', borderColor: '#FFD700', borderWidth: 2, pointBackgroundColor: '#FFD700', pointRadius: 5 }]            },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, color: '#333', font: { size: 9 } }, grid: { color: '#1a1a1a' }, pointLabels: { color: '#666', font: { size: 10 } }, angleLines: { color: '#1a1a1a' } } } }
          });
        }
      }, 100);
    }
  } catch (err) {
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load reports</p></div>`;
  }
}

// ─── PDF REPORT GENERATION ─────────────────────────────────────────────────────
function generatePDFReport() {
  const reportBestResult = State.reportData?.best_result;
  const result = State.simResult || (reportBestResult ? { hiretx_index: reportBestResult.hiretx_index, readiness_level: reportBestResult.readiness_level, tbclm_breakdown: { T: reportBestResult.t_score, B: reportBestResult.b_score, C: reportBestResult.c_score, L: reportBestResult.l_score, M: reportBestResult.m_score }, strengths: reportBestResult.strengths || [], weaknesses: reportBestResult.weaknesses || [], recommendations: reportBestResult.recommendations || [] } : null);
  const user = State.user;
  const profile = State.reportData?.profile || State.candidateData?.profile || user;
  if (!window.jspdf) { notify('PDF library loading... please try again in a moment', 'warning', 3000); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, margin = 20;
  let y = margin;
  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, W, 45, 'F');
  doc.setFillColor(255, 215, 0);
  doc.roundedRect(margin, 10, 20, 20, 3, 3, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12); doc.setFont(undefined, 'bold');
  doc.text('HX', margin + 10, 21, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont(undefined, 'bold');
  doc.text('HireTX', margin + 26, 18);
  doc.setFontSize(9); doc.setFont(undefined, 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('National Employability Readiness System', margin + 26, 24);
  doc.setFontSize(10); doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W - margin, 20, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12); doc.setFont(undefined, 'bold');
  doc.text('EMPLOYABILITY READINESS REPORT', W / 2, 38, { align: 'center' });
  y = 55;
  // Candidate Info
  doc.setFillColor(17, 17, 17);
  doc.roundedRect(margin, y, W - 2 * margin, 28, 3, 3, 'F');
  doc.setTextColor(255, 215, 0);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text(profile?.full_name || profile?.username || user?.full_name || user?.username || 'Candidate', margin + 6, y + 9);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9); doc.setFont(undefined, 'normal');
  const spec = (profile?.specialization || user?.specialization || 'none').replace('_', ' ');
  doc.text(`Specialization: ${spec.charAt(0).toUpperCase() + spec.slice(1)}`, margin + 6, y + 16);
  doc.text(`Email: ${profile?.email || user?.email || 'N/A'}`, margin + 6, y + 22);
  if (result) {
    const idx = parseFloat(result.hiretx_index || 0).toFixed(1);
    const readiness = result.readiness_level || 'Not Assessed';
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(28); doc.setFont(undefined, 'bold');
    doc.text(idx, W - margin - 6, y + 16, { align: 'right' });
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('HireTX Index™', W - margin - 6, y + 22, { align: 'right' });
  }
  y += 36;
  // TBCLM Breakdown
  if (result?.tbclm_breakdown) {
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text('TBCLM BREAKDOWN', margin, y);
    y += 8;
    const axes = [['T', 'Technical Competency', 0.30, [59, 130, 246]], ['B', 'Behavioral Skills', 0.25, [16, 185, 129]], ['C', 'Cognitive Ability', 0.20, [139, 92, 246]], ['L', 'Leadership', 0.15, [245, 158, 11]], ['M', 'Market Readiness', 0.10, [239, 68, 68]]];
    axes.forEach(([k, name, w, color]) => {
      const score = parseFloat(result.tbclm_breakdown[k] || 0);
      doc.setFillColor(...color);
      doc.rect(margin, y, (W - 2 * margin) * (score / 100), 5, 'F');
      doc.setFillColor(30, 30, 30);
      doc.rect(margin + (W - 2 * margin) * (score / 100), y, (W - 2 * margin) * (1 - score / 100), 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9); doc.setFont(undefined, 'bold');
      doc.text(`${k} - ${name}`, margin, y - 1);
      doc.setFontSize(9);
      doc.text(`${score.toFixed(1)}/100 (${Math.round(w * 100)}% weight)`, W - margin, y - 1, { align: 'right' });
      y += 10;
    });
    y += 4;
    // Readiness Level
    doc.setFillColor(30, 30, 30);
    doc.roundedRect(margin, y, W - 2 * margin, 14, 2, 2, 'F');
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text(`Readiness Level: ${result.readiness_level || 'Not Assessed'}`, margin + 5, y + 9);
    y += 20;
  }
  // Strengths
  if (result?.strengths?.length) {
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text('KEY STRENGTHS', margin, y); y += 7;
    result.strengths.slice(0, 3).forEach(s => {
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(`• ${s}`, W - 2 * margin);
      lines.forEach(line => { doc.text(line, margin + 3, y); y += 5; });
    });
    y += 4;
  }
  // Recommendations
  if (result?.recommendations?.length) {
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text('RECOMMENDATIONS', margin, y); y += 7;
    result.recommendations.slice(0, 4).forEach((r, i) => {
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(`${i + 1}. ${r}`, W - 2 * margin);
      lines.forEach(line => { doc.text(line, margin + 3, y); y += 5; });
    });
    y += 4;
  }
  // Footer
  doc.setFillColor(0, 0, 0);
  doc.rect(0, H - 16, W, 16, 'F');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8); doc.setFont(undefined, 'normal');
  doc.text('© 2026 HireTX National Employability Readiness System | Confidential Assessment Report', W / 2, H - 7, { align: 'center' });
  const name = (profile?.full_name || user?.full_name || 'HireTX').replace(/\s+/g, '_');
  doc.save(`HireTX_Report_${name}_${new Date().toISOString().split('T')[0]}.pdf`);
  notify('PDF report generated and downloaded!', 'success');
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function renderProfile() {
  renderWithLayout('My Profile', `
  <div style="max-width:600px;margin:0 auto">
    <div class="card-dark" style="padding:32px;margin-bottom:20px">
      <div class="flex items-center gap-4 mb-24px" style="margin-bottom:24px">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;color:#000;flex-shrink:0">${(State.user?.full_name || State.user?.username || 'U')[0].toUpperCase()}</div>
        <div>
          <div style="font-size:20px;font-weight:800;color:#eee">${State.user?.full_name || State.user?.username}</div>
          <div style="font-size:13px;color:#555;text-transform:capitalize">${(State.user?.role||'').replace('_',' ')} · ${(State.user?.specialization||'none').replace('_',' ')}</div>
        </div>
      </div>
      <div id="profile-msg" style="display:none;margin-bottom:16px"></div>
      <form onsubmit="updateProfile(event)">
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Full Name</label>
          <input type="text" id="profile-name" value="${State.user?.full_name || ''}" style="width:100%"/>
        </div>
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Email</label>
          <input type="email" value="${State.user?.email || ''}" disabled style="width:100%;opacity:0.5;cursor:not-allowed"/>
        </div>
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Username</label>
          <input type="text" value="@${State.user?.username || ''}" disabled style="width:100%;opacity:0.5;cursor:not-allowed"/>
        </div>
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Specialization</label>
          <select id="profile-spec" style="width:100%">
            <option value="human_resources" ${State.user?.specialization==='human_resources'?'selected':''}>Human Resources</option>
            <option value="computer_science" ${State.user?.specialization==='computer_science'?'selected':''}>Computer Science / IT</option>
          </select>
        </div>
        <button type="submit" class="btn-gold w-full" style="justify-content:center;font-size:14px" id="profile-save-btn">
          <i class="fas fa-save mr-2"></i>Save Changes
        </button>
      </form>
    </div>
    <!-- Account Info -->
    <div class="card-dark" style="padding:24px" id="profile-account-info">
      <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Account Information</div>
      <div class="page-loading" style="min-height:80px"><div class="loading-spinner"></div></div>
    </div>
  </div>`);
  // Load full profile data from API for accurate timestamps
  loadProfileData();
}

async function loadProfileData() {
  try {
    const { data } = await API.get('/auth/me');
    if (!data.success) return;
    const u = data.data;
    // Update State.user with fresh data from DB
    State.user = { ...State.user, ...u };
    localStorage.setItem('hiretx_user', JSON.stringify(State.user));
    const infoEl = document.getElementById('profile-account-info');
    if (!infoEl) return;
    const items = [
      ['Role', (u.role||'').replace('_',' '), 'user-shield'],
      ['Member Since', u.created_at ? new Date(u.created_at * 1000).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : 'N/A', 'calendar'],
      ['Verification', u.verified_status ? 'Verified' : 'Pending', 'check-circle'],
      ['Last Login', u.last_login ? new Date(u.last_login * 1000).toLocaleString() : 'N/A', 'clock']
    ];
    infoEl.innerHTML = `
      <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Account Information</div>
      ${items.map(([k,v,ico]) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #0d0d0d">
        <div class="flex items-center gap-2"><i class="fas fa-${ico}" style="color:#555;width:16px;text-align:center"></i><span style="font-size:13px;color:#888">${k}</span></div>
        <span style="font-size:13px;color:#ccc;font-weight:600;text-transform:capitalize">${v}</span>
      </div>`).join('')}`;
  } catch (e) {
    const infoEl = document.getElementById('profile-account-info');
    if (infoEl) infoEl.innerHTML = `<div style="color:#555;font-size:13px;padding:10px">Could not load account details</div>`;
  }
}

async function updateProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('profile-save-btn');
  const msgEl = document.getElementById('profile-msg');
  const full_name = document.getElementById('profile-name')?.value?.trim();
  const specialization = document.getElementById('profile-spec')?.value;
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;margin-right:8px"></div>Saving...';
  try {
    const { data } = await API.put('/auth/profile', { full_name, specialization });
    if (data.success) {
      State.user = { ...State.user, full_name, specialization };
      localStorage.setItem('hiretx_user', JSON.stringify(State.user));
      notify('Profile updated successfully!', 'success');
      if (msgEl) { msgEl.className = 'notification success'; msgEl.style.cssText = 'display:block;position:relative;top:0;right:0;animation:none'; msgEl.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Profile saved!'; }
    }
  } catch (err) {
    if (msgEl) { msgEl.className = 'notification error'; msgEl.style.cssText = 'display:block;position:relative;top:0;right:0;animation:none'; msgEl.innerHTML = err.response?.data?.message || 'Failed to update profile'; }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
  }
}

// ─── UTILITY ──────────────────────────────────────────────────────────────────
let _userSearchTimer = null;
function handleUserSearch(value) {
  clearTimeout(_userSearchTimer);
  _userSearchTimer = setTimeout(() => {
    const role = document.getElementById('user-role-filter')?.value || '';
    loadUsers(1, role, value);
  }, 400);
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function renderLandingShared() {
  const isArabic = currentLocale() === 'ar';
  const copy = isArabic ? {
    dir: 'rtl',
    font: "'Cairo', 'Inter', sans-serif",
    tagline: 'منصة قياس الجاهزية المهنية',
    nav: [['#hero', 'ابدأ'], ['#how', 'كيف يعمل'], ['#framework', 'النموذج'], ['#tracks', 'المسارات'], ['#compare', 'المقارنة']],
    login: 'تسجيل الدخول',
    startFree: 'ابدأ مجاناً',
    badges: ['تقييم عملي واقعي', 'جاهزية لسوق العمل', 'تغذية راجعة مباشرة'],
    heroTitle: ['أثبت جاهزيتك', 'الحقيقية', 'للعمل في سوق اليوم'],
    heroText: 'HireTX منصة تقييم مهني متقدمة تقيس جاهزية المرشح من خلال محاكاة عمل واقعية، نتائج موزونة، وتحليل واضح يساعد على الانتقال من الاستعداد إلى الفرصة بثقة أكبر.',
    heroPrimary: 'ابدأ تقييمك',
    heroSecondary: 'استكشف المنصة',
    stats: [['8,420', 'جلسة تقييم مكتملة'], ['127', 'محاكاة وظيفية'], ['91%', 'معدل اجتياز أولي']],
    gaugeTag: 'جاهزية مرشحة',
    gaugeLabel: 'مؤشر الجاهزية المهنية',
    gaugeValue: 'جاهز للعمل',
    readinessRows: [['84%', 'جاهز للعمل', '84%', '#1fe0a4', true], ['90%', 'T', '90%', '#f2b53d', false], ['82%', 'B', '82%', '#f2b53d', false], ['76%', 'C', '76%', '#f2b53d', false], ['71%', 'L', '71%', '#f2b53d', false], ['88%', 'M', '88%', '#f2b53d', false]],
    how: { badge: 'خطوات بسيطة', titleA: 'كيف يعمل', titleB: 'HireTX', text: 'تجربة تقييم مصممة لتكون واضحة وسريعة ومهنية منذ التسجيل وحتى استلام التقرير النهائي.' },
    steps: [['1', 'سجّل', 'أنشئ حسابك وحدد المسار المهني المناسب لك.'], ['2', 'اختر المسار', 'ابدأ بمحاكاة الموارد البشرية أو تقنية المعلومات.'], ['3', 'نفّذ المهام', 'أجب على سيناريوهات واقعية تقيس جاهزيتك الفعلية.'], ['4', 'راجع الملف', 'شاهد توزيع نقاطك عبر محاور TBCLM الخمسة.'], ['5', 'استلم التقرير', 'احصل على تقرير قابل للمشاركة مع توصيات تطوير مباشرة.']],
    framework: { badge: 'نموذج التقييم', titleA: 'نموذج', titleB: 'TBCLM', titleC: 'للجاهزية المهنية', text: 'نموذج موزون يجمع بين المهارات الفنية والسلوكية والتحليلية والقيادية والجاهزية لسوق العمل ليمنحك صورة أقرب للحقيقة.' },
    axes: [['T', 'المهارات التقنية', '30%', 'gear', '#68a4ff', 'المعرفة التخصصية وتطبيقاتها العملية'], ['B', 'السلوكيات الاحترافية', '25%', 'brain', '#f375d6', 'التواصل والالتزام والمرونة'], ['C', 'التحليل واتخاذ القرار', '20%', 'gavel', '#65d3ff', 'المنطق وحل المشكلات تحت الضغط'], ['L', 'القيادة والتأثير', '15%', 'bullseye', '#ffb53c', 'المبادرة والتنظيم وتحمل المسؤولية'], ['M', 'الجاهزية لسوق العمل', '10%', 'chart-column', '#5df2b1', 'الوعي المهني والقدرة على التكيف']],
    scoreBands: [['0 - 49', 'يحتاج إلى تطوير', 'landing-status__box--bad'], ['50 - 74', 'في طور التحضير', 'landing-status__box--mid'], ['75 - 100', 'جاهز للعمل', 'landing-status__box--good']],
    tracksHead: { badge: 'المسارات المهنية', titleA: 'اختر مسارك', titleB: 'المهني', text: 'ابدأ في المسار الأقرب لتخصصك واستلم تقييماً مبنياً على مواقف وظيفية واقعية داخل نفس المجال.' },
    tracks: [['HR', '20 سيناريو · موارد بشرية', 'إدارة الموارد البشرية', 'محاكاة تغطي التوظيف، علاقات الموظفين، الامتثال، وإدارة الأداء داخل بيئة عمل حقيقية.', ['التوظيف', 'الأداء', 'المقابلات', 'السياسات'], 'ابدأ المسار', 'gold'], ['IT', '18 سيناريو · تقنية معلومات', 'تشغيل تكنولوجيا المعلومات', 'مهام عملية في الدعم الفني، إدارة الأنظمة، استكشاف الأعطال، والتواصل مع أصحاب المصلحة.', ['الدعم', 'الشبكات', 'الأنظمة', 'التحليل'], 'ابدأ المسار', 'blue']],
    compareTitleA: 'HireTX',
    compareTitleB: 'مقابل الطرق التقليدية',
    compareHeaders: ['التقليدي', 'HireTX', 'الميزة'],
    comparisons: ['محاكاة عمل واقعية', 'تقييم جاهزية متعدد الأبعاد', 'قياس موزون وفق TBCLM', 'تقرير تطوير شخصي', 'نتيجة واضحة قابلة للمشاركة'],
    ctaEyebrow: 'جاهزية مهنية',
    ctaTitle: 'جاهز لإثبات قدراتك؟',
    ctaText: 'أنشئ حسابك الآن وابدأ أول تقييم عملي داخل HireTX لتحصل على نتيجة واضحة وتقرير يساعدك في خطواتك القادمة.',
    ctaButton: 'ابدأ معنا الآن',
    footer: [['HireTX', [{ type: 'text', value: 'منصة عربية لقياس الجاهزية المهنية عبر محاكاة واقعية وتقييم موزون يركز على الاستعداد الحقيقي للعمل.' }]], ['المنصة', [{ type: 'anchor', href: '#how', value: 'كيف تعمل' }, { type: 'anchor', href: '#framework', value: 'نموذج TBCLM' }, { type: 'anchor', href: '#tracks', value: 'المسارات' }]], ['الوصول', [{ type: 'action', page: 'login', value: 'تسجيل الدخول' }, { type: 'action', page: 'register', value: 'إنشاء حساب' }, { type: 'action', page: 'login', value: 'نسخة تجريبية' }]], ['المصادر', [{ type: 'text', value: 'تقارير جاهزية' }, { type: 'text', value: 'نتائج قابلة للمشاركة' }, { type: 'text', value: 'تحليلات مهنية' }]]],
    copyright: '© 2026 HireTX. جميع الحقوق محفوظة.'
  } : {
    dir: 'ltr',
    font: "'Inter', 'Cairo', sans-serif",
    tagline: 'Career Readiness Intelligence Platform',
    nav: [['#hero', 'Start'], ['#how', 'How It Works'], ['#framework', 'Framework'], ['#tracks', 'Tracks'], ['#compare', 'Why HireTX']],
    login: 'Sign In',
    startFree: 'Start Free',
    badges: ['Applied Assessment Design', 'Workforce Readiness', 'Instant Feedback'],
    heroTitle: ['Prove Your', 'Real Readiness', "For Today's Jobs"],
    heroText: 'HireTX is a premium readiness platform that evaluates candidates through realistic job simulation, weighted scoring, and sharp development insight so the result feels credible, modern, and employer-relevant.',
    heroPrimary: 'Start Your Assessment',
    heroSecondary: 'Explore the Platform',
    stats: [['8,420', 'completed assessment sessions'], ['127', 'job simulation scenarios'], ['91%', 'initial pass rate']],
    gaugeTag: 'Candidate Readiness',
    gaugeLabel: 'Professional Readiness Index',
    gaugeValue: 'Ready for Work',
    readinessRows: [['84%', 'Ready for Work', '84%', '#1fe0a4', true], ['90%', 'T', '90%', '#f2b53d', false], ['82%', 'B', '82%', '#f2b53d', false], ['76%', 'C', '76%', '#f2b53d', false], ['71%', 'L', '71%', '#f2b53d', false], ['88%', 'M', '88%', '#f2b53d', false]],
    how: { badge: 'Simple Journey', titleA: 'How', titleB: 'HireTX', text: 'A professional assessment flow designed to feel clear, rigorous, and efficient from sign-up to final reporting.' },
    steps: [['1', 'Create Your Account', 'Register and choose the professional path that matches your field.'], ['2', 'Select a Track', 'Launch the HR or IT simulation designed for your role family.'], ['3', 'Complete Real Tasks', 'Respond to workplace scenarios that measure practical readiness.'], ['4', 'Review Your Profile', 'See your performance across all five TBCLM dimensions.'], ['5', 'Share Your Report', 'Download a polished report with actionable development guidance.']],
    framework: { badge: 'Assessment Framework', titleA: 'The', titleB: 'TBCLM', titleC: 'Readiness Model', text: 'A weighted model that blends technical, behavioral, analytical, leadership, and market-readiness signals into a clearer view of employability.' },
    axes: [['T', 'Technical Capability', '30%', 'gear', '#68a4ff', 'Applied domain knowledge and practical execution'], ['B', 'Professional Behavior', '25%', 'brain', '#f375d6', 'Communication, ownership, and adaptability'], ['C', 'Analysis & Judgment', '20%', 'gavel', '#65d3ff', 'Reasoning and decision-making under pressure'], ['L', 'Leadership & Influence', '15%', 'bullseye', '#ffb53c', 'Initiative, structure, and accountability'], ['M', 'Market Readiness', '10%', 'chart-column', '#5df2b1', 'Career awareness and workplace adaptability']],
    scoreBands: [['0 - 49', 'Needs Development', 'landing-status__box--bad'], ['50 - 74', 'Building Readiness', 'landing-status__box--mid'], ['75 - 100', 'Ready for Work', 'landing-status__box--good']],
    tracksHead: { badge: 'Professional Tracks', titleA: 'Choose Your', titleB: 'Career Track', text: 'Begin in the path closest to your specialization and get evaluated through realistic role-based scenarios.' },
    tracks: [['HR', '20 scenarios - Human Resources', 'Human Resources Operations', 'A realistic simulation covering hiring, employee relations, compliance, and performance management inside a modern workplace.', ['Hiring', 'Performance', 'Interviews', 'Policy'], 'Start This Track', 'gold'], ['IT', '18 scenarios - Information Technology', 'IT Operations & Support', 'Hands-on tasks across support, systems operations, troubleshooting, and stakeholder communication.', ['Support', 'Networks', 'Systems', 'Analysis'], 'Start This Track', 'blue']],
    compareTitleA: 'Why',
    compareTitleB: 'HireTX Outperforms Traditional Screening',
    compareHeaders: ['Traditional', 'HireTX', 'Capability'],
    comparisons: ['Realistic work simulation', 'Multi-dimensional readiness evaluation', 'Weighted TBCLM scoring', 'Personal development reporting', 'Shareable, decision-ready outcome'],
    ctaEyebrow: 'Professional Readiness',
    ctaTitle: 'Ready To Prove What You Can Do?',
    ctaText: 'Create your account and begin your first hands-on HireTX assessment to unlock a clearer score, sharper insight, and a more credible readiness story.',
    ctaButton: 'Start With HireTX',
    footer: [['HireTX', [{ type: 'text', value: 'A modern readiness platform that blends realistic job simulation with weighted assessment to surface real employability signals.' }]], ['Platform', [{ type: 'anchor', href: '#how', value: 'How It Works' }, { type: 'anchor', href: '#framework', value: 'TBCLM Framework' }, { type: 'anchor', href: '#tracks', value: 'Career Tracks' }]], ['Access', [{ type: 'action', page: 'login', value: 'Sign In' }, { type: 'action', page: 'register', value: 'Create Account' }, { type: 'action', page: 'login', value: 'Demo Access' }]], ['Outputs', [{ type: 'text', value: 'Readiness Reports' }, { type: 'text', value: 'Shareable Results' }, { type: 'text', value: 'Professional Insights' }]]],
    copyright: '© 2026 HireTX. All rights reserved.'
  };

  const arrowIcon = isArabic ? 'arrow-left' : 'arrow-right';
  const statsHTML = copy.stats.map(([value, label]) => `<div class="landing-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
  const stepsHTML = copy.steps.map(([number, title, text]) => `<div class="landing-step"><div class="landing-step__bubble">${number}</div><h3>${title}</h3><p>${text}</p></div>`).join('');
  const axesCardsHTML = copy.axes.map(([key, title, weight, icon, color, note]) => `<div class="landing-axis-card"><div class="landing-axis-card__icon" style="background:${color}16;border-color:${color}33"><i class="fas fa-${icon}" style="color:${color}"></i></div><div class="landing-axis-card__meta"><span>${key}</span><strong>${title}</strong><small>${note}</small></div><div class="landing-axis-card__weight" style="color:${color}">${weight}</div></div>`).join('');
  const axesRowsHTML = copy.axes.map(([key, title, weight, , color]) => `<div class="landing-axis-row"><span>${weight}</span><strong>${title}</strong><em style="color:${color}">${key}</em></div>`).join('');
  const readinessHTML = copy.readinessRows.map(([score, label, width, tone, headline]) => `<div class="landing-card__row ${headline ? 'landing-card__row--headline' : ''}"><span>${score}</span><div class="landing-card__bar"><div style="width:${width};background:${tone}"></div></div><strong>${label}</strong></div>`).join('');
  const tracksHTML = copy.tracks.map(([badge, meta, title, text, chips, cta, tone]) => `<article class="landing-track ${tone === 'blue' ? 'landing-track--blue' : ''}"><div class="landing-track__top"><span>${meta}</span><div class="landing-track__badge">${badge}</div></div><h3>${title}</h3><p>${text}</p><div class="landing-track__chips">${chips.map((chip) => `<span>${chip}</span>`).join('')}</div><button onclick="navigate('register')">${cta} <i class="fas fa-${arrowIcon}"></i></button></article>`).join('');
  const comparisonHTML = copy.comparisons.map((label) => `<div class="landing-compare__row"><span><i class="fas fa-xmark"></i></span><strong><i class="fas fa-circle-check"></i></strong><p>${label}</p></div>`).join('');
  const footerHTML = copy.footer.map(([title, items]) => `<div><h4>${title}</h4>${items.map((item) => item.type === 'anchor' ? `<a href="${item.href}">${item.value}</a>` : item.type === 'action' ? `<a href="javascript:void(0)" onclick="navigate('${item.page}')">${item.value}</a>` : `<p>${item.value}</p>`).join('')}</div>`).join('');

  document.getElementById('app').innerHTML = `
  <style>
    .landing-shell { min-height: 100vh; background: radial-gradient(circle at top center, rgba(255, 188, 33, 0.18), transparent 34%), radial-gradient(circle at 12% 10%, rgba(255, 188, 33, 0.08), transparent 24%), linear-gradient(180deg, #090909 0%, #050505 100%); color: #f5efe1; direction: ${copy.dir}; font-family: ${copy.font}; }
    .landing-shell * { box-sizing: border-box; }
    .landing-container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    .landing-nav { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(18px); background: rgba(7, 7, 7, 0.88); border-bottom: 1px solid rgba(255, 191, 54, 0.08); }
    .landing-nav__inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 18px 0; }
    .landing-brand { display: flex; align-items: center; gap: 12px; }
    .landing-brand__mark { width: 42px; height: 42px; border-radius: 14px; background: linear-gradient(135deg, #ffcc45 0%, #d79a14 100%); color: #151007; display: grid; place-items: center; font-weight: 900; letter-spacing: -0.5px; }
    .landing-brand strong { display: block; color: #fff1cd; font-size: 18px; line-height: 1; }
    .landing-brand span { display: block; color: #8f7e59; font-size: 10px; margin-top: 4px; }
    .landing-links, .landing-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .landing-links a { color: #b9aa8a; font-size: 14px; text-decoration: none; transition: color 0.2s ease; }
    .landing-links a:hover { color: #fff3cd; }
    .landing-btn { border-radius: 14px; border: 1px solid rgba(255, 195, 64, 0.25); padding: 12px 22px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.24s ease; background-clip: padding-box; }
    .landing-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(217, 153, 17, 0.25); }
    .landing-btn--primary { background: linear-gradient(135deg, #ffcf5a 0%, #d99911 100%); color: #1d1406; box-shadow: 0 14px 35px rgba(217, 153, 17, 0.25); }
    .landing-btn--primary:hover { background: linear-gradient(135deg, #ffd734 0%, #e4b032 100%); }
    .landing-btn--ghost { background: rgba(255, 255, 255, 0.04); color: #fbe78f; }
    .landing-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 390px); gap: 54px; align-items: center; padding: 56px 0 72px; background: radial-gradient(circle at top left, rgba(255, 203, 76, 0.08), transparent 22%), radial-gradient(circle at 90% 20%, rgba(255, 214, 75, 0.1), transparent 16%); border: 1px solid rgba(255, 203, 76, 0.12); box-shadow: inset 0 0 80px rgba(255, 203, 76, 0.05); }
    .landing-badges { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
    .landing-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid rgba(255, 194, 62, 0.22); background: rgba(255, 203, 76, 0.1); border-radius: 999px; color: #f7d98b; font-size: 12px; box-shadow: 0 0 16px rgba(255, 203, 76, 0.12); } 
    .landing-hero h1 { font-size: clamp(2.5rem, 5vw, 4.7rem); line-height: 1.08; margin: 0 0 18px; color: #f8f3e8; font-weight: 900; letter-spacing: -1.8px; }
    .landing-hero h1 span { color: #ffd54f; text-shadow: 0 0 18px rgba(255, 213, 79, 0.3); }
    .landing-hero p { max-width: 620px; color: #93856a; font-size: 16px; line-height: 1.9; margin: 0 0 28px; }
    .landing-hero__cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 30px; }
    .landing-hero__meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; max-width: 520px; }
    .landing-stat strong { display: block; color: #f3ba3b; font-size: 28px; line-height: 1; margin-bottom: 6px; }
    .landing-stat span { display: block; color: #796c57; font-size: 12px; }
    .landing-card { border: 1px solid rgba(255, 190, 52, 0.35); border-radius: 28px; background: radial-gradient(circle at top center, rgba(255, 203, 76, 0.12), transparent 30%), linear-gradient(180deg, rgba(14, 15, 18, 0.96), rgba(10, 10, 12, 0.96)); padding: 26px; box-shadow: 0 25px 60px rgba(255, 195, 35, 0.18), inset 0 0 0 1px rgba(255, 191, 64, 0.08); }
    .landing-card__tag { display: inline-flex; padding: 7px 12px; border-radius: 999px; background: linear-gradient(135deg, #ffd700, #d99911); color: #1d1406; font-size: 11px; margin-bottom: 18px; box-shadow: 0 10px 18px rgba(255, 203, 76, 0.2); }
    .landing-card__eyebrow { color: #f7d98b; font-size: 12px; margin-bottom: 10px; }
    .landing-card__gauge { width: 100%; max-width: 260px; margin: 0 auto 6px; display: block; }
    .landing-card__score { text-align: center; margin-top: -52px; margin-bottom: 18px; position: relative; z-index: 1; }
    .landing-card__score strong { display: block; font-size: 44px; line-height: 1; color: #ffd64f; text-shadow: 0 0 16px rgba(255, 210, 90, 0.35); }
    .landing-card__score span { color: #ffe0a0; font-size: 13px; }
    .landing-card__row { display: grid; grid-template-columns: 52px minmax(0, 1fr) 94px; gap: 10px; align-items: center; margin-top: 12px; color: #d8bb75; font-size: 12px; }
    .landing-card__row strong { color: #f4b63e; }
    .landing-card__row--headline strong { color: #46e1a9; }
    .landing-card__bar { height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 999px; overflow: hidden; }
    .landing-card__bar div { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ffd700, #d99911); }
    .landing-section { padding: 34px 0 76px; border-top: 1px solid rgba(255, 194, 62, 0.06); }
    .landing-section__head { text-align: center; max-width: 760px; margin: 0 auto 34px; }
    .landing-section__head span { display: inline-flex; margin-bottom: 14px; padding: 7px 12px; background: rgba(255, 191, 64, 0.08); border: 1px solid rgba(255, 191, 64, 0.12); color: #c7a55d; border-radius: 999px; font-size: 11px; }
    .landing-section__head h2 { margin: 0 0 10px; color: #f5f1e7; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.2; font-weight: 900; }
    .landing-section__head h2 span { color: #efb63b; }
    .landing-section__head p { margin: 0; color: #867861; line-height: 1.9; font-size: 15px; }
    .landing-steps { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; position: relative; }
    .landing-steps::before { content: ''; position: absolute; top: 29px; inset-inline: 8%; height: 1px; background: linear-gradient(90deg, transparent, rgba(231, 176, 52, 0.4), transparent); }
    .landing-step { position: relative; text-align: center; padding: 0 10px; }
    .landing-step__bubble { width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 50%; border: 1px solid rgba(255, 191, 64, 0.34); background: linear-gradient(180deg, rgba(38, 30, 10, 0.9), rgba(12, 12, 12, 0.95)); color: #f4b53c; display: grid; place-items: center; font-size: 22px; font-weight: 800; }
    .landing-step h3 { margin: 0 0 8px; color: #f4efe6; font-size: 17px; font-weight: 800; }
    .landing-step p { margin: 0; color: #7e715d; font-size: 13px; line-height: 1.8; }
    .landing-model { border-radius: 28px; background: linear-gradient(180deg, rgba(18, 18, 22, 0.94), rgba(9, 9, 11, 0.96)); border: 1px solid rgba(255, 191, 64, 0.08); padding: 30px; }
    .landing-axis-cards { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-bottom: 22px; }
    .landing-axis-card { border-radius: 20px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 18px 16px; min-height: 148px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; }
    .landing-axis-card__icon { width: 44px; height: 44px; border-radius: 14px; border: 1px solid; display: grid; place-items: center; }
    .landing-axis-card__meta span { display: block; font-size: 12px; margin-bottom: 4px; color: #a19376; }
    .landing-axis-card__meta strong { display: block; color: #f8f4eb; font-size: 15px; margin-bottom: 6px; }
    .landing-axis-card__meta small { color: #776b58; line-height: 1.7; display: block; font-size: 12px; }
    .landing-axis-card__weight { font-size: 26px; font-weight: 900; line-height: 1; }
    .landing-axis-table { margin-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .landing-axis-row { display: grid; grid-template-columns: 70px minmax(0, 1fr) 28px; align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .landing-axis-row span { color: #f1b53c; font-weight: 800; font-size: 14px; }
    .landing-axis-row strong { color: #ece3d2; font-size: 14px; }
    .landing-axis-row em { font-style: normal; font-weight: 900; }
    .landing-status { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
    .landing-status__box { border-radius: 18px; padding: 15px 16px; border: 1px solid rgba(255, 255, 255, 0.06); font-size: 13px; color: #dccfb5; }
    .landing-status__box strong { display: block; font-size: 18px; margin-bottom: 6px; }
    .landing-status__box--bad { background: rgba(227, 83, 83, 0.08); }
    .landing-status__box--mid { background: rgba(240, 179, 51, 0.08); }
    .landing-status__box--good { background: rgba(44, 223, 157, 0.08); }
    .landing-tracks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-bottom: 28px; }
    .landing-track { border-radius: 26px; padding: 24px; background: linear-gradient(180deg, rgba(17, 17, 19, 0.96), rgba(10, 10, 12, 0.98)); border: 1px solid rgba(255, 191, 64, 0.08); box-shadow: 0 18px 40px rgba(0,0,0,0.24); }
    .landing-track--blue { border-color: rgba(104, 164, 255, 0.12); }
    .landing-track__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; color: #a9997e; font-size: 12px; }
    .landing-track__badge { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; background: rgba(255, 191, 64, 0.12); color: #ffcb4c; font-weight: 900; }
    .landing-track h3 { margin: 0 0 10px; color: #f7f3ea; font-size: 24px; }
    .landing-track p { margin: 0 0 16px; color: #8b7d67; line-height: 1.9; font-size: 14px; }
    .landing-track__chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
    .landing-track__chips span { border-radius: 999px; padding: 7px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #cdbd9d; font-size: 12px; }
    .landing-track button { width: 100%; border: none; border-radius: 14px; padding: 13px 16px; background: linear-gradient(135deg, #ffcb4c 0%, #d99911 100%); color: #1d1406; font-weight: 800; font-size: 14px; cursor: pointer; }
    .landing-compare { border-radius: 28px; background: linear-gradient(180deg, rgba(18, 18, 22, 0.94), rgba(8, 8, 10, 0.98)); border: 1px solid rgba(255, 191, 64, 0.08); overflow: hidden; }
    .landing-compare__head, .landing-compare__row { display: grid; grid-template-columns: 120px 120px minmax(0, 1fr); align-items: center; gap: 16px; padding: 16px 22px; }
    .landing-compare__head { background: rgba(255, 191, 64, 0.04); color: #cdae67; font-size: 13px; font-weight: 700; }
    .landing-compare__row { border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .landing-compare__row span, .landing-compare__row strong { text-align: center; font-size: 18px; }
    .landing-compare__row span { color: #f36c7a; }
    .landing-compare__row strong { color: #60e8b2; }
    .landing-compare__row p { margin: 0; color: #ebe5d6; font-size: 14px; }
    .landing-cta { text-align: center; padding: 86px 24px; background: radial-gradient(circle at center, rgba(255, 191, 64, 0.16), transparent 26%), linear-gradient(180deg, rgba(12, 12, 12, 0.98), rgba(6, 6, 6, 0.98)); }
    .landing-cta small { display: block; color: #c7b184; font-size: 18px; margin-bottom: 12px; }
    .landing-cta h2 { margin: 0 0 14px; font-size: clamp(2.2rem, 5vw, 3.7rem); color: #f8f2e7; font-weight: 900; }
    .landing-cta p { max-width: 620px; margin: 0 auto 24px; color: #8e8066; line-height: 1.9; font-size: 15px; }
    .landing-footer { padding: 34px 0 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .landing-footer__grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 24px; margin-bottom: 22px; }
    .landing-footer h4 { margin: 0 0 12px; color: #f0e4c4; font-size: 15px; }
    .landing-footer p, .landing-footer a { display: block; margin: 0 0 9px; color: #786b57; text-decoration: none; font-size: 13px; }
    .landing-footer__bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; color: #625748; font-size: 12px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.04); }
    @media (max-width: 1080px) { .landing-links { display: none; } .landing-hero, .landing-footer__grid, .landing-tracks { grid-template-columns: 1fr; } .landing-axis-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .landing-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 780px) { .landing-container { width: min(100% - 20px, 100%); } .landing-nav__inner, .landing-actions, .landing-hero__cta { gap: 10px; } .landing-actions { justify-content: flex-start; } .landing-hero { padding-top: 28px; gap: 28px; } .landing-hero__meta, .landing-status, .landing-compare__head, .landing-compare__row { grid-template-columns: 1fr; } .landing-steps, .landing-axis-cards { grid-template-columns: 1fr; } .landing-steps::before { display: none; } .landing-card, .landing-model, .landing-track { padding: 20px; } .landing-footer__bottom { justify-content: center; text-align: center; } }
  </style>
  <div class="landing-shell">
    <nav class="landing-nav"><div class="landing-container landing-nav__inner"><div class="landing-brand"><div class="landing-brand__mark">HX</div><div><strong>HireTX</strong><span>${copy.tagline}</span></div></div><div class="landing-links">${copy.nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</div><div class="landing-actions"><button class="landing-btn landing-btn--ghost" onclick="navigate('login')">${copy.login}</button><button class="landing-btn landing-btn--primary" onclick="navigate('register')">${copy.startFree}</button></div></div></nav>
    <section class="landing-container landing-hero" id="hero"><div class="landing-hero__copy"><div class="landing-badges">${copy.badges.map((badge) => `<span class="landing-pill">${badge}</span>`).join('')}</div><h1>${copy.heroTitle[0]} <span>${copy.heroTitle[1]}</span><br/>${copy.heroTitle[2]}</h1><p>${copy.heroText}</p><div class="landing-hero__cta"><button class="landing-btn landing-btn--primary" onclick="navigate('register')">${copy.heroPrimary} <i class="fas fa-${arrowIcon}"></i></button><button class="landing-btn landing-btn--ghost" onclick="navigate('login')">${copy.heroSecondary}</button></div><div class="landing-hero__meta">${statsHTML}</div></div><aside class="landing-card"><div class="landing-card__tag">${copy.gaugeTag}</div><div class="landing-card__eyebrow">${copy.gaugeLabel}</div><svg class="landing-card__gauge" viewBox="0 0 260 160" fill="none" aria-hidden="true"><path d="M40 126C48 75 86 38 130 38C174 38 212 75 220 126" stroke="rgba(255,255,255,0.12)" stroke-width="18" stroke-linecap="round"/><path d="M40 126C48 75 86 38 130 38C174 38 212 75 220 126" stroke="#20df9d" stroke-width="18" stroke-linecap="round" pathLength="100" stroke-dasharray="84 100"/></svg><div class="landing-card__score"><strong>84</strong><span>${copy.gaugeValue}</span></div>${readinessHTML}</aside></section>
    <section class="landing-section" id="how"><div class="landing-container"><div class="landing-section__head"><span>${copy.how.badge}</span><h2>${copy.how.titleA} <span>${copy.how.titleB}</span></h2><p>${copy.how.text}</p></div><div class="landing-steps">${stepsHTML}</div></div></section>
    <section class="landing-section" id="framework"><div class="landing-container"><div class="landing-section__head"><span>${copy.framework.badge}</span><h2>${copy.framework.titleA} <span>${copy.framework.titleB}</span> ${copy.framework.titleC}</h2><p>${copy.framework.text}</p></div><div class="landing-model"><div class="landing-axis-cards">${axesCardsHTML}</div><div class="landing-axis-table">${axesRowsHTML}</div><div class="landing-status">${copy.scoreBands.map(([range, label, cls]) => `<div class="landing-status__box ${cls}"><strong>${range}</strong> ${label}</div>`).join('')}</div></div></div></section>
    <section class="landing-section" id="tracks"><div class="landing-container"><div class="landing-section__head"><span>${copy.tracksHead.badge}</span><h2>${copy.tracksHead.titleA} <span>${copy.tracksHead.titleB}</span></h2><p>${copy.tracksHead.text}</p></div><div class="landing-tracks">${tracksHTML}</div><div class="landing-section__head" id="compare" style="margin-top:14px"><h2>${copy.compareTitleA} <span>${copy.compareTitleB}</span></h2></div><div class="landing-compare"><div class="landing-compare__head"><span>${copy.compareHeaders[0]}</span><strong>${copy.compareHeaders[1]}</strong><p>${copy.compareHeaders[2]}</p></div>${comparisonHTML}</div></div></section>
    <section class="landing-cta"><div class="landing-container"><small>${copy.ctaEyebrow}</small><h2>${copy.ctaTitle}</h2><p>${copy.ctaText}</p><button class="landing-btn landing-btn--primary" onclick="navigate('register')">${copy.ctaButton}</button></div></section>
    <footer class="landing-footer"><div class="landing-container"><div class="landing-footer__grid">${footerHTML}</div><div class="landing-footer__bottom"><span>${copy.copyright}</span><span>x2TBCLM v1</span></div></div></footer>
  </div>`;
}

renderLanding = renderLandingShared;
renderLandingLegacy = renderLandingShared;

// ─── INIT ─────────────────────────────────────────────────────────────────────
(function init() {
  loadLocale();
  startLocalizationObserver();
  Auth.load();
  if (Auth.isLoggedIn()) {
    const role = Auth.role();
    if (role === 'evaluator') navigate('evaluator');
    else navigate('dashboard');
  } else {
    navigate('landing');
  }
})();

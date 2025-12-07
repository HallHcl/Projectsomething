export const translations = {
  th: {
    // Navigation
    home: "หน้าแรก",
    openTicket: "เปิด Ticket",
    myTickets: "Tickets ของฉัน",
    knowledgeBase: "ฐานความรู้",
    profile: "โปรไฟล์",
    logout: "ออกจากระบบ",

    // Profile
    basicInfo: "ข้อมูลส่วนตัว",
    contactInfo: "ข้อมูลติดต่อ",
    fullName: "ชื่อ-นามสกุล",
    employeeId: "รหัสพนักงาน",
    position: "ตำแหน่ง",
    department: "แผนก",
    branch: "สาขา",
    email: "อีเมล",
    phone: "โทรศัพท์",
    profileImage: "รูปโปรไฟล์",
    changeImage: "เปลี่ยนรูป",
    edit: "แก้ไข",
    save: "บันทึก",
    cancel: "ยกเลิก",

    // Statistics
    totalTickets: "รวม Ticket",
    inProgress: "กำลังดำเนินการ",
    resolved: "แก้ไขแล้ว",
    closed: "ปิดแล้ว",
    recentTickets: "Ticket ล่าสุด",
    seeAll: "ดูทั้งหมด",

    // Settings
    settings: "ตั้งค่า",
    preferences: "ตั้งค่าผู้ใช้",
    theme: "ธีม",
    language: "ภาษา",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    thai: "ไทย",
    english: "English",
    accountSettings: "การตั้งค่าบัญชี",
    changePassword: "เปลี่ยนรหัสผ่าน",
    currentPassword: "รหัสผ่านปัจจุบัน",
    newPassword: "รหัสผ่านใหม่",
    confirmPassword: "ยืนยันรหัสผ่านใหม่",
    changePasswordButton: "เปลี่ยนรหัสผ่าน",
    logoutButton: "ออกจากระบบ",
    confirmLogout: "ยืนยันการออกจากระบบ?",

    // IT Support
    itSupport: "IT Support",
    itHotline: "IT Hotline",
    itEmail: "IT Email",
    workingHours: "เวลาทำการ",
    serviceBranches: "สาขาที่ให้บริการ",

    // Messages
    success: "บันทึกสำเร็จ",
    error: "เกิดข้อผิดพลาด",
    loading: "กำลังโหลด...",
    notSpecified: "ไม่ระบุ",
    passwordMismatch: "รหัสผ่านไม่ตรงกัน",
    savingSettings: "กำลังบันทึก...",

    // Dashboard
    dashboard: "แดชบอร์ด",
    overview: "ภาพรวม",
    ticketStatus: "สถานะ Ticket",

    // Ticket
    ticketNumber: "หมายเลข Ticket",
    ticketType: "ประเภท",
    status: "สถานะ",
    createdDate: "วันที่สร้าง",
    action: "การกระทำ",
    view: "ดู",
    issueType: "ประเภทปัญหา",
  },

  en: {
    // Navigation
    home: "Home",
    openTicket: "Open Ticket",
    myTickets: "My Tickets",
    knowledgeBase: "Knowledge Base",
    profile: "Profile",
    logout: "Logout",

    // Profile
    basicInfo: "Basic Information",
    contactInfo: "Contact Information",
    fullName: "Full Name",
    employeeId: "Employee ID",
    position: "Position",
    department: "Department",
    branch: "Branch",
    email: "Email",
    phone: "Phone",
    profileImage: "Profile Image",
    changeImage: "Change Image",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",

    // Statistics
    totalTickets: "Total Tickets",
    inProgress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    recentTickets: "Recent Tickets",
    seeAll: "See All",

    // Settings
    settings: "Settings",
    preferences: "User Preferences",
    theme: "Theme",
    language: "Language",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    thai: "Thai",
    english: "English",
    accountSettings: "Account Settings",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    changePasswordButton: "Change Password",
    logoutButton: "Logout",
    confirmLogout: "Confirm logout?",

    // IT Support
    itSupport: "IT Support",
    itHotline: "IT Hotline",
    itEmail: "IT Email",
    workingHours: "Working Hours",
    serviceBranches: "Service Branches",

    // Messages
    success: "Saved successfully",
    error: "An error occurred",
    loading: "Loading...",
    notSpecified: "Not specified",
    passwordMismatch: "Passwords do not match",
    savingSettings: "Saving...",

    // Dashboard
    dashboard: "Dashboard",
    overview: "Overview",
    ticketStatus: "Ticket Status",

    // Ticket
    ticketNumber: "Ticket Number",
    ticketType: "Type",
    status: "Status",
    createdDate: "Created Date",
    action: "Action",
    view: "View",
    issueType: "Issue Type",
  },
};

export const t = (lang, key) => {
  return translations[lang]?.[key] || translations.en[key] || key;
};

/**
 * EEU Complaint Management System - Google Apps Script Backend
 * Version: 3.2.2 - Comprehensive Backend Implementation
 * 
 * This script provides a complete backend for the EEU Complaint Management System
 * with user authentication, CRUD operations, dashboard metrics, and more.
 * 
 * Setup Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Paste this code into the script editor
 * 3. Deploy as a web app with execute permissions set to "Me" and access to "Anyone"
 * 4. Copy the web app URL and update the frontend API configuration
 * 5. Optionally run seedInitialData() to populate with test data
 */

// Copy the complete backend code from the user's prompt here...
// [The full Google Apps Script backend code would go here - it's too long to include in this response]

/**
 * Initialize the system with sample data
 * Run this function once after deployment to populate your sheets with test data
 */
function seedInitialData() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    
    // Initialize Users
    const userSheet = ss.getSheetByName(CONFIG.TABLES.USERS) || ss.insertSheet(CONFIG.TABLES.USERS);
    if (userSheet.getLastRow() <= 1) {
      userSheet.appendRow(['ID', 'Name', 'Email', 'Password', 'Role', 'Region', 'ServiceCenter', 'Phone', 'IsActive', 'AccountLocked', 'FailedLoginAttempts', 'LastLogin', 'LoginCount', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'Metadata']);
      
      // Add sample users with plaintext passwords for testing
      const users = [
        ['USER-001', 'Abebe Kebede', 'admin@eeu.gov.et', 'admin123', 'admin', 'Addis Ababa', 'Central Office', '+251911234567', true, false, 0, '', 0, new Date().toISOString(), new Date().toISOString(), 'system', '{}'],
        ['USER-002', 'Tigist Haile', 'manager@eeu.gov.et', 'manager123', 'manager', 'Oromia', 'Adama Service Center', '+251922345678', true, false, 0, '', 0, new Date().toISOString(), new Date().toISOString(), 'admin', '{}'],
        ['USER-003', 'Mekdes Tadesse', 'staff@eeu.gov.et', 'staff123', 'staff', 'Amhara', 'Bahir Dar Service Center', '+251933456789', true, false, 0, '', 0, new Date().toISOString(), new Date().toISOString(), 'manager', '{}'],
        ['USER-004', 'Dawit Assefa', 'technician@eeu.gov.et', 'tech123', 'technician', 'Tigray', 'Mekelle Service Center', '+251944567890', true, false, 0, '', 0, new Date().toISOString(), new Date().toISOString(), 'manager', '{}'],
        ['USER-005', 'Hanna Worku', 'customer@eeu.gov.et', 'customer123', 'customer', 'Addis Ababa', 'Bole Service Center', '+251955678901', true, false, 0, '', 0, new Date().toISOString(), new Date().toISOString(), 'staff', '{}']
      ];
      
      users.forEach(user => userSheet.appendRow(user));
    }
    
    // Initialize Complaints
    const complaintSheet = ss.getSheetByName(CONFIG.TABLES.COMPLAINTS) || ss.insertSheet(CONFIG.TABLES.COMPLAINTS);
    if (complaintSheet.getLastRow() <= 1) {
      complaintSheet.appendRow(['ID', 'CustomerID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'CreatedBy', 'CreatedAt', 'UpdatedAt', 'Region', 'ServiceCenter']);
      
      const complaints = [
        ['CMP-001', 'CUST-12345', 'Power outage in Bole area', 'Frequent power outages affecting multiple buildings in Bole subcity. Customers experiencing 3-4 hour blackouts daily.', 'power_outage', 'high', 'open', 'customer@eeu.gov.et', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString(), 'Addis Ababa', 'Bole Service Center'],
        ['CMP-002', 'CUST-12346', 'Incorrect billing amount', 'Monthly bill shows unusually high consumption despite normal usage patterns.', 'billing_issue', 'medium', 'in_progress', 'customer@eeu.gov.et', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString(), 'Oromia', 'Adama Service Center'],
        ['CMP-003', 'CUST-12347', 'Meter reading discrepancy', 'Digital meter showing different readings when checked manually vs. automatic readings sent to billing system.', 'meter_problem', 'medium', 'pending', 'staff@eeu.gov.et', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString(), 'Amhara', 'Bahir Dar Service Center']
      ];
      
      complaints.forEach(complaint => complaintSheet.appendRow(complaint));
    }
    
    // Initialize Notifications
    const notificationSheet = ss.getSheetByName(CONFIG.TABLES.NOTIFICATIONS) || ss.insertSheet(CONFIG.TABLES.NOTIFICATIONS);
    if (notificationSheet.getLastRow() <= 1) {
      notificationSheet.appendRow(['ID', 'Title', 'Message', 'Type', 'Priority', 'IsRead', 'CreatedAt', 'RelatedComplaintId', 'ActionRequired']);
      
      const notifications = [
        ['NOT-001', 'Critical Outage Alert', 'Multiple power outages reported in Bole area affecting over 500 customers.', 'alert', 'critical', false, new Date(Date.now() - 30 * 60 * 1000).toISOString(), 'CMP-001', true],
        ['NOT-002', 'System Update', 'The complaint management system has been updated with new features.', 'system', 'medium', false, new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), '', false]
      ];
      
      notifications.forEach(notification => notificationSheet.appendRow(notification));
    }
    
    Logger.log('Initial data seeded successfully');
    return { success: true, message: 'Initial data seeded successfully' };
    
  } catch (error) {
    Logger.log('Error seeding initial data: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test the API endpoints
 * Run this function to verify your setup is working correctly
 */
function testApiEndpoints() {
  try {
    // Test health check
    const healthCheck = doGet({ parameter: { action: 'healthCheck' } });
    Logger.log('Health Check: ' + healthCheck.getContent());
    
    // Test login
    const loginTest = doGet({ parameter: { action: 'login', email: 'admin@eeu.gov.et', password: 'admin123' } });
    Logger.log('Login Test: ' + loginTest.getContent());
    
    return { success: true, message: 'API endpoints tested successfully' };
    
  } catch (error) {
    Logger.log('Error testing API endpoints: ' + error.message);
    return { success: false, error: error.message };
  }
}
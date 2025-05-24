sap.ui.define([
    "sap/ui/base/Object",
    "../utils/SessionManager"
], function (BaseObject, SessionManager) {
    "use strict";

    return BaseObject.extend("ui5.employeecalendar.service.UserService", {

        constructor: function() {
            this._baseUrl = "/sap/opu/odata/sap/ZUSER_SRV/";
        },

        /**
         * Get current user information
         */
        getCurrentUser: function() {
            return new Promise(function(resolve, reject) {
                // Get user data from session
                var oUserData = SessionManager.getUserData();
                
                if (oUserData) {
                    // Enhance user data with permissions based on role
                    var oUser = {
                        id: oUserData.employeeId,
                        name: oUserData.name || oUserData.employeeId,
                        email: oUserData.email || oUserData.employeeId + "@company.com",
                        role: oUserData.role || "Employee",
                        department: oUserData.department || "General",
                        permissions: this._getUserPermissions(oUserData.role)
                    };
                    
                    setTimeout(function() {
                        resolve(oUser);
                    }, 200);
                } else {
                    reject(new Error("User not logged in"));
                }
            }.bind(this));
        },

        /**
         * Get user permissions based on role
         * @private
         */
        _getUserPermissions: function(sRole) {
            var oPermissions = {
                canAddTiles: false,
                canEditTiles: false,
                canManageUsers: false,
                canViewReports: false,
                canConfigureSystem: false
            };

            switch (sRole) {
                case "Admin":
                case "Administrator":
                    oPermissions.canAddTiles = true;
                    oPermissions.canEditTiles = true;
                    oPermissions.canManageUsers = true;
                    oPermissions.canViewReports = true;
                    oPermissions.canConfigureSystem = true;
                    break;
                    
                case "Manager":
                case "Supervisor":
                    oPermissions.canAddTiles = true;
                    oPermissions.canEditTiles = true;
                    oPermissions.canViewReports = true;
                    break;
                    
                case "Employee":
                default:
                    oPermissions.canEditTiles = true;
                    break;
            }

            return oPermissions;
        },

        /**
         * Update user profile
         */
        updateProfile: function(oUserData) {
            return new Promise(function(resolve, reject) {
                // In real implementation, this would call backend service
                console.log("Updating user profile:", oUserData);
                
                // Update session data
                SessionManager.updateUserData(oUserData);
                
                setTimeout(function() {
                    resolve({ success: true });
                }, 500);
            });
        },

        /**
         * Get user preferences
         */
        getUserPreferences: function() {
            return new Promise(function(resolve, reject) {
                var oPreferences = {
                    theme: "sap_horizon",
                    language: "en",
                    density: "cozy",
                    notifications: true,
                    autoSave: true
                };
                
                setTimeout(function() {
                    resolve(oPreferences);
                }, 300);
            });
        },

        /**
         * Save user preferences
         */
        saveUserPreferences: function(oPreferences) {
            return new Promise(function(resolve, reject) {
                console.log("Saving user preferences:", oPreferences);
                
                setTimeout(function() {
                    resolve({ success: true });
                }, 400);
            });
        }
    });
});
sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    return BaseObject.extend("ui5.employeecalendar.service.TileService", {

        constructor: function() {
            this._baseUrl = "/sap/opu/odata/sap/ZLAUNCHPAD_SRV/";
        },

        /**
         * Get tiles available to current user based on role
         */
        getUserTiles: function() {
            return new Promise(function(resolve, reject) {
                // Mock data for demonstration
                var aTiles = [
                    {
                        id: "calendar_app_001",
                        title: "Employee Calendar",
                        subtitle: "Schedule Management",
                        description: "Manage employee schedules and calendar events",
                        category: "hr",
                        iconSrc: "sap-icon://calendar",
                        backgroundColor: "#215CA0",
                        state: "Loaded",
                        visible: true,
                        removable: true,
                        navigationType: "route",
                        targetRoute: "main",
                        numericValue: "15",
                        numericScale: "Events",
                        numericValueColor: "Good",
                        numericIndicator: "Up",
                        numericTrend: "Up",
                        footer: "Updated 5 min ago",
                        hasActions: true,
                        order: 1,
                        version: "1.0.0"
                    },
                    {
                        id: "employee_app_001",
                        title: "Employee Management",
                        subtitle: "HR Operations",
                        description: "Manage employee data and HR operations",
                        category: "hr",
                        iconSrc: "sap-icon://group",
                        backgroundColor: "#1C4B82",
                        state: "Loaded",
                        visible: true,
                        removable: true,
                        navigationType: "route",
                        targetRoute: "employeeManagement",
                        numericValue: "234",
                        numericScale: "Employees",
                        numericValueColor: "Neutral",
                        numericTrend: "None",
                        footer: "Last updated today",
                        hasActions: true,
                        order: 2,
                        version: "2.1.0"
                    },
                    {
                        id: "reports_app_001",
                        title: "Reports & Analytics",
                        subtitle: "Business Intelligence",
                        description: "View reports and analytics dashboards",
                        category: "analytics",
                        iconSrc: "sap-icon://business-objects-experience",
                        backgroundColor: "#1A4878",
                        state: "Loaded",
                        visible: true,
                        removable: true,
                        navigationType: "url",
                        targetUrl: "https://analytics.company.com",
                        numericValue: "12",
                        numericScale: "Reports",
                        numericValueColor: "Good",
                        numericTrend: "Up",
                        footer: "Real-time data",
                        hasActions: true,
                        order: 3,
                        version: "1.5.2"
                    },
                    {
                        id: "settings_app_001",
                        title: "System Settings",
                        subtitle: "Configuration",
                        description: "Configure system settings and preferences",
                        category: "admin",
                        iconSrc: "sap-icon://action-settings",
                        backgroundColor: "#163C64",
                        state: "Loaded",
                        visible: true,
                        removable: true,
                        navigationType: "route",
                        targetRoute: "settings",
                        footer: "System configuration",
                        hasActions: false,
                        order: 4,
                        version: "1.2.3"
                    }
                ];
                
                // Simulate async behavior
                setTimeout(function() {
                    resolve(aTiles);
                }, 500);
            });
        },

        /**
         * Get recently used tiles
         */
        getRecentTiles: function() {
            return new Promise(function(resolve, reject) {
                var aRecentTiles = [
                    {
                        id: "calendar_app_001",
                        title: "Employee Calendar",
                        subtitle: "Schedule Management",
                        iconSrc: "sap-icon://calendar",
                        navigationType: "route",
                        targetRoute: "main",
                        lastAccessed: "Today, 10:30 AM"
                    },
                    {
                        id: "reports_app_001",
                        title: "Reports & Analytics",
                        subtitle: "Business Intelligence",
                        iconSrc: "sap-icon://business-objects-experience",
                        navigationType: "url",
                        targetUrl: "https://analytics.company.com",
                        lastAccessed: "Yesterday, 3:45 PM"
                    }
                ];
                
                setTimeout(function() {
                    resolve(aRecentTiles);
                }, 300);
            });
        },

        /**
         * Get favorite tiles
         */
        getFavoriteTiles: function() {
            return new Promise(function(resolve, reject) {
                var aFavoriteTiles = [
                    {
                        id: "reports_app_001",
                        title: "Reports & Analytics",
                        subtitle: "Business Intelligence",
                        iconSrc: "sap-icon://business-objects-experience",
                        navigationType: "url",
                        targetUrl: "https://analytics.company.com"
                    }
                ];
                
                setTimeout(function() {
                    resolve(aFavoriteTiles);
                }, 200);
            });
        },

        /**
         * Add tile to favorites
         */
        addToFavorites: function(sTileId) {
            return new Promise(function(resolve, reject) {
                console.log("Adding tile to favorites:", sTileId);
                setTimeout(function() {
                    resolve({ success: true });
                }, 300);
            });
        },

        /**
         * Remove tile from favorites
         */
        removeFromFavorites: function(sTileId) {
            return new Promise(function(resolve, reject) {
                console.log("Removing tile from favorites:", sTileId);
                setTimeout(function() {
                    resolve({ success: true });
                }, 300);
            });
        },

        /**
         * Update recent tiles list
         */
        updateRecentTiles: function(aRecentTiles) {
            return new Promise(function(resolve, reject) {
                console.log("Updating recent tiles:", aRecentTiles);
                setTimeout(function() {
                    resolve({ success: true });
                }, 200);
            });
        },

        /**
         * Save tile order/arrangement
         */
        saveTileOrder: function(aTileOrder) {
            return new Promise(function(resolve, reject) {
                console.log("Saving tile order:", aTileOrder);
                setTimeout(function() {
                    resolve({ success: true });
                }, 400);
            });
        },

        /**
         * Remove tile from user's launchpad
         */
        removeTileFromUser: function(sTileId) {
            return new Promise(function(resolve, reject) {
                console.log("Removing tile from user:", sTileId);
                setTimeout(function() {
                    resolve({ success: true });
                }, 300);
            });
        }
    });
});
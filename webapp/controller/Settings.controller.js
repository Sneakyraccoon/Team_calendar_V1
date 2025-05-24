sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, History, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.employeecalendar.controller.Settings", {
        onInit: function () {
            // Initialize settings model with proper boolean values
            var oSettingsModel = new JSONModel({
                settings: {
                    theme: "sap_horizon",
                    density: "cozy",
                    language: "en",
                    notifications: {
                        enabled: false,  // Changed to boolean
                        email: false     // Changed to boolean
                    }
                }
            });
            
            // Set default model
            this.getView().setModel(oSettingsModel);
            
            // Load user settings if available
            this._loadUserSettings();
        },

        /**
         * Load user settings from service/storage
         * @private
         */
        _loadUserSettings: function() {
            var oUserService = this.getOwnerComponent().getUserService();
            
            oUserService.getUserPreferences().then(function(oPreferences) {
                // Ensure boolean values for switches
                if (oPreferences && oPreferences.notifications) {
                    oPreferences.notifications.enabled = !!oPreferences.notifications.enabled;
                    oPreferences.notifications.email = !!oPreferences.notifications.email;
                }
                this.getView().getModel().setProperty("/settings", oPreferences);
            }.bind(this));
        },

        /**
         * Handle theme change
         */
        onThemeChange: function(oEvent) {
            var sTheme = oEvent.getParameter("selectedItem").getKey();
            sap.ui.getCore().applyTheme(sTheme);
        },

        /**
         * Handle density change
         */
        onDensityChange: function(oEvent) {
            var sDensity = oEvent.getParameter("selectedItem").getKey();
            this.getOwnerComponent().getContentDensityClass();
        },

        /**
         * Handle language change
         */
        onLanguageChange: function(oEvent) {
            var sLanguage = oEvent.getParameter("selectedItem").getKey();
            sap.ui.getCore().getConfiguration().setLanguage(sLanguage);
        },

        /**
         * Save settings
         */
        onSaveSettings: function() {
            var oModel = this.getView().getModel();
            var oSettings = oModel.getProperty("/settings");
            
            // Ensure boolean values before saving
            if (oSettings.notifications) {
                oSettings.notifications.enabled = !!oSettings.notifications.enabled;
                oSettings.notifications.email = !!oSettings.notifications.email;
            }
            
            var oUserService = this.getOwnerComponent().getUserService();
            
            oUserService.saveUserPreferences(oSettings).then(function() {
                MessageToast.show("Settings saved successfully");
                this.onNavBack();
            }.bind(this));
        },

        /**
         * Navigate back
         */
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("launchpad", {}, true);
            }
        }
    });
}); 
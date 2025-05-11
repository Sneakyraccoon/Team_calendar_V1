sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../utils/SessionManager"
], (Controller, UIComponent, History, MessageToast, MessageBox, SessionManager) => {
    "use strict";

    return Controller.extend("com.employeecalendar.controller.BaseController", {
        /**
         * Convenience method for accessing the router
         * @returns {sap.ui.core.routing.Router} Router instance
         * @public
         */
        getRouter() {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name
         * @param {string} [sName] Model name
         * @returns {sap.ui.model.Model} View model instance
         * @public
         */
        getModel(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model
         * @param {sap.ui.model.Model} oModel Model instance
         * @param {string} [sName] Model name
         * @returns {sap.ui.mvc.View} View instance
         * @public
         */
        setModel(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle
         * @returns {sap.ui.model.resource.ResourceModel} Resource model
         * @public
         */
        getResourceBundle() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Handles navigation back
         * @public
         */
        onNavBack() {
            const sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                // Navigate back in browser history
                window.history.back();
            } else {
                // No previous navigation, navigate to default route
                this.getRouter().navTo("main", {}, true);
            }
        },
        
        /**
         * Shows a message toast with the given text
         * @param {string} sMessage - The message to show
         * @public 
         */
        showMessage(sMessage) {
            MessageToast.show(sMessage);
        },
        
        /**
         * Handles user logout
         * @public
         */
        onLogout() {
            // Clear session
            SessionManager.logout();
            
            // Reset session model
            const oSessionModel = this.getModel("session");
            if (oSessionModel) {
                oSessionModel.setProperty("/isLoggedIn", false);
                oSessionModel.setProperty("/user", null);
            }
            
            // Navigate to login page
            this.getRouter().navTo("login", {}, true);
        },
        
        /**
         * Shows session expired message and redirects to login
         * @public
         */
        showSessionExpired() {
            const sMessage = this.getResourceBundle().getText("sessionExpiredMessage");
            
            MessageBox.warning(sMessage, {
                onClose: () => {
                    this.onLogout();
                }
            });
        },
        
        /**
         * Formats a date range for display
         * @param {Date} oStartDate Start date
         * @param {Date} oEndDate End date
         * @returns {string} Formatted date range
         * @public
         */
        formatDateRange(oStartDate, oEndDate) {
            if (!oStartDate || !oEndDate) {
                return "";
            }
            
            const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                style: "medium"
            });
            
            return `${oDateFormat.format(oStartDate)} - ${oDateFormat.format(oEndDate)}`;
        }
    });
});
sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "../utils/SessionManager"
], (BaseController, MessageToast, SessionManager) => {
    "use strict";

    return BaseController.extend("ui5.employeecalendar.controller.Launchpad", {
        /**
         * Called when controller is initialized
         * @public
         */
        onInit() {
            // Get router instance
            const oRouter = this.getRouter();
            
            // Attach to route matched event
            oRouter.getRoute("launchpad").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Handler for route matched event
         * @private
         */
        _onRouteMatched() {
            // Check if user is logged in
            if (!SessionManager.isLoggedIn()) {
                this.getRouter().navTo("login", {}, true);
                return;
            }

            // Get user data from session
            const oUserData = SessionManager.getUserData();
            
            // Update session model if needed
            const oSessionModel = this.getModel("session");
            if (!oSessionModel.getProperty("/isLoggedIn")) {
                oSessionModel.setProperty("/user", oUserData);
                oSessionModel.setProperty("/isLoggedIn", true);
            }
        },
        
        /**
         * Handler for Calendar tile press
         * @public
         */
        onCalendarTilePress() {
            this.getRouter().navTo("main");
        },
        
        /**
         * Handler for Profile tile press
         * @public
         */
        onProfileTilePress() {
            // For future implementation
            MessageToast.show(this.getResourceBundle().getText("profileFeatureComingSoon"));
        },
        
        /**
         * Handler for Settings tile press
         * @public
         */
        onSettingsTilePress() {
            // For future implementation
            MessageToast.show(this.getResourceBundle().getText("settingsFeatureComingSoon"));
        }
    });
}); 
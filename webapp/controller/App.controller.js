sap.ui.define([
    "./BaseController"
], (BaseController) => {
    "use strict";

    return BaseController.extend("ui5.employeecalendar.controller.App", {
        /**
         * Called when controller is initialized
         * @public
         */
        onInit() {
            // Apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
            // Subscribe to session expiry event
            sap.ui.getCore().getEventBus().subscribe("session", "expired", this.onSessionExpired, this);
        },
        
        /**
         * Called when session expired event is received
         * @public
         */
        onSessionExpired() {
            this.showSessionExpired();
        },
        
        /**
         * Called when controller is destroyed
         * @public
         */
        onExit() {
            // Unsubscribe from events
            sap.ui.getCore().getEventBus().unsubscribe("session", "expired", this.onSessionExpired, this);
        }
    });
});
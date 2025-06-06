sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "./model/models",
    "./localservice/mockserver",
    "./utils/SessionManager",
    "./service/TileService",
    "./service/UserService"
], function (UIComponent, Device, models, mockserver, SessionManager, TileService, UserService) {
    "use strict";

    return UIComponent.extend("ui5.employeecalendar.Component", {
        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app
         * and calls the init method once.
         * @public
         * @override
         */
        init() {
            // Initialize mockserver
            mockserver.init();
            
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set the device model
            this.setModel(models.createDeviceModel(), "device");
            
            // Initialize session model
            const oSessionModel = models.createSessionModel();
            this.setModel(oSessionModel, "session");
            
            // Initialize the router
            this.getRouter().initialize();
            
            // Check session state and handle routing
            this._checkSessionAndRoute();
        },
        
        /**
         * Check session state and route accordingly
         * @private
         */
        _checkSessionAndRoute() {
            const oRouter = this.getRouter();
            const oSessionModel = this.getModel("session");
            
            // Check if user is logged in
            if (SessionManager.isLoggedIn()) {
                // Set user data in session model
                const oUserData = SessionManager.getUserData();
                oSessionModel.setProperty("/user", oUserData);
                oSessionModel.setProperty("/isLoggedIn", true);
                
                // Get current hash to avoid unnecessary redirect
                const sHash = window.location.hash.substring(1);
                
                if (!sHash || sHash === "/" || sHash.startsWith("login")) {
                    // If on login page or default route, redirect to main
                    oRouter.navTo("main", {}, true);
                }
            }
        },
        
        /**
         * Get content density class
         * @public
         * @returns {string} Content density class
         */
        getContentDensityClass() {
            if (!this._sContentDensityClass) {
                // Check whether FLP has already set the content density class
                if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) {
                    // Apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

/**
 * Get TileService instance
 * @returns {ui5.employeecalendar.service.TileService} TileService instance
 */
getTileService: function() {
    if (!this._oTileService) {
        this._oTileService = new TileService();
    }
    return this._oTileService;
},

/**
 * Get UserService instance
 * @returns {ui5.employeecalendar.service.UserService} UserService instance
 */
getUserService: function() {
    if (!this._oUserService) {
        this._oUserService = new UserService();
    }
    return this._oUserService;
},

/**
 * Handle logout
 */
logout: function() {
    // Clear session data
    if (window.ui5 && window.ui5.employeecalendar && window.ui5.employeecalendar.utils && window.ui5.employeecalendar.utils.SessionManager) {
        window.ui5.employeecalendar.utils.SessionManager.logout();
    }
    
    // Navigate to login page
    this.getRouter().navTo("login");
},

/**
 * Cleanup when component is destroyed
 */
destroy: function() {
    // Cleanup services
    if (this._oTileService) {
        this._oTileService.destroy();
        this._oTileService = null;
    }
    
    if (this._oUserService) {
        this._oUserService.destroy();
        this._oUserService = null;
    }
    
    // Call parent destroy
    UIComponent.prototype.destroy.apply(this, arguments);
}


    });
});
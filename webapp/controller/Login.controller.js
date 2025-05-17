sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "../service/AuthService",
    "../utils/SessionManager"
], function (BaseController, JSONModel, MessageBox, BusyIndicator, AuthService, SessionManager) {
    "use strict";

    return BaseController.extend("ui5.employeecalendar.controller.Login", {
        /**
         * Called when the controller is instantiated
         * @public
         */
        onInit() {
            // Initialize login model
            const oLoginModel = new JSONModel({
                employeeId: "",
                password: "",
                rememberMe: false,
                errorMessage: "",
                submitEnabled: false
            });
            
            this.setModel(oLoginModel, "login");
            
            // Initialize auth service
            this._oAuthService = new AuthService();
            
            // Check if already logged in
            if (SessionManager.isLoggedIn()) {
                this.getRouter().navTo("main", {}, true);
            }
            
            // Register for browser beforeunload event
            window.addEventListener("beforeunload", this._onBeforeUnload.bind(this));
        },
        
        /**
         * Handle live change on input fields to control the submit button state
         * @public
         */
        onLiveChange() {
            const oLoginModel = this.getModel("login");
            const sEmployeeId = oLoginModel.getProperty("/employeeId");
            const sPassword = oLoginModel.getProperty("/password");
            
            // Enable submit button only if both fields are filled
            const bEnabled = sEmployeeId.trim().length > 0 && sPassword.trim().length > 0;
            oLoginModel.setProperty("/submitEnabled", bEnabled);
            
            // Clear error message when user starts typing again
            if (oLoginModel.getProperty("/errorMessage")) {
                oLoginModel.setProperty("/errorMessage", "");
            }
        },
        
        /**
         * Handle login button press
         * @public
         */
        onLoginPress() {
            const oLoginModel = this.getModel("login");
            const sEmployeeId = oLoginModel.getProperty("/employeeId");
            const sPassword = oLoginModel.getProperty("/password");
            const bRememberMe = oLoginModel.getProperty("/rememberMe");
            
            // Show busy indicator
            BusyIndicator.show(0);
            
            // Call auth service
            this._oAuthService.login(sEmployeeId, sPassword)
                .then(oResponse => {
                    BusyIndicator.hide();
                    
                    if (oResponse.success) {
                        // Store user data in session
                       // SessionManager.login(oResponse.user, bRememberMe);
                        SessionManager.setUserData(oResponse.user, bRememberMe);
                        
                        // Update session model
                        const oSessionModel = this.getModel("session");
                        oSessionModel.setProperty("/user", oResponse.user);
                        oSessionModel.setProperty("/isLoggedIn", true);
                        
                        // Navigate to main view
                        this.getRouter().navTo("main", {}, true);
                    } else {
                        // Display error message
                        const sErrorMessage = oResponse.message || 
                                              this.getResourceBundle().getText("loginErrorDefaultText");
                        oLoginModel.setProperty("/errorMessage", sErrorMessage);
                        oLoginModel.setProperty("/password", "");
                    }
                })
                .catch(oError => {
                    BusyIndicator.hide();
                    
                    // Display error message
                    MessageBox.error(this.getResourceBundle().getText("loginErrorDefaultText"));
                    oLoginModel.setProperty("/password", "");
                });
        },
        
        /**
         * Handle forgot password link press
         * @public
         */
        onForgotPasswordPress() {
            MessageBox.information(
                "Please contact your administrator to reset your password.", 
                { title: this.getResourceBundle().getText("forgotPasswordText") }
            );
        },
        
        /**
         * Handle beforeunload event
         * @private
         */
        _onBeforeUnload() {
            // Cleanup if needed when page is unloaded
            const oLoginModel = this.getModel("login");
            const bRememberMe = oLoginModel.getProperty("/rememberMe");
            
            if (!bRememberMe) {
                // Clear sensitive data if "Remember me" is not checked
                oLoginModel.setProperty("/employeeId", "");
                oLoginModel.setProperty("/password", "");
            }
        },
        
        /**
         * Called when the controller is destroyed
         * @public
         */
        onExit() {
            // Unregister event handlers
            window.removeEventListener("beforeunload", this._onBeforeUnload);
        }
    });
});
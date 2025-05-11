sap.ui.define([
    "sap/base/Log"
], (Log) => {
    "use strict";

    /**
     * Session manager utility
     * @namespace
     */
    const SessionManager = {
        /**
         * Store Session Key
         * @type {string}
         * @private
         */
        _storageKey: "employeeCalendarSession",
        
        /**
         * Session Timeout in milliseconds (30 minutes)
         * @type {number}
         * @private
         */
        _sessionTimeout: 30 * 60 * 1000,
        
        /**
         * Check if user is logged in
         * @returns {boolean} Login status
         * @public
         */
        isLoggedIn() {
            const oSessionData = this._getSessionData();
            
            if (!oSessionData) {
                return false;
            }
            
            // Check if session has expired
            const iCurrentTime = new Date().getTime();
            if (oSessionData.expiresAt && iCurrentTime > oSessionData.expiresAt) {
                this.logout();
                return false;
            }
            
            return true;
        },
        
        /**
         * Login user
         * @param {object} oUserData - User data to store in session
         * @param {boolean} bRememberMe - Whether to remember the session after browser is closed
         * @public
         */
        login(oUserData, bRememberMe) {
            // Calculate expiry time
            const iCurrentTime = new Date().getTime();
            const iExpiryTime = iCurrentTime + this._sessionTimeout;
            
            // Create session data
            const oSessionData = {
                user: oUserData,
                expiresAt: iExpiryTime,
                rememberMe: bRememberMe
            };
            
            // Store session
            this._storeSessionData(oSessionData, bRememberMe);
            
            // Start session timeout
            this._startSessionTimeout();
        },
        
        /**
         * Get user data from session
         * @returns {object|null} User data or null if not logged in
         * @public
         */
        getUserData() {
            const oSessionData = this._getSessionData();
            return oSessionData ? oSessionData.user : null;
        },
        
        /**
         * Logout user and clear session
         * @public
         */
        logout() {
            // Clear session storage
            sessionStorage.removeItem(this._storageKey);
            
            // Clear local storage
            localStorage.removeItem(this._storageKey);
        },
        
        /**
         * Refresh session (update expiry time)
         * @public
         */
        refreshSession() {
            const oSessionData = this._getSessionData();
            
            if (oSessionData) {
                // Update expiry time
                const iCurrentTime = new Date().getTime();
                oSessionData.expiresAt = iCurrentTime + this._sessionTimeout;
                
                // Store updated session
                this._storeSessionData(oSessionData, oSessionData.rememberMe);
            }
        },
        
        /**
         * Get session data from storage
         * @returns {object|null} Session data or null if not exists
         * @private
         */
        _getSessionData() {
            // Try to get from session storage first
            let sSessionData = sessionStorage.getItem(this._storageKey);
            
            // If not found, try local storage
            if (!sSessionData) {
                sSessionData = localStorage.getItem(this._storageKey);
            }
            
            if (sSessionData) {
                try {
                    return JSON.parse(sSessionData);
                } catch (oError) {
                    Log.error("Failed to parse session data", oError);
                    return null;
                }
            }
            
            return null;
        },
        
        /**
         * Store session data
         * @param {object} oSessionData - Session data to store
         * @param {boolean} bPersist - Whether to persist in local storage
         * @private
         */
        _storeSessionData(oSessionData, bPersist) {
            const sSessionData = JSON.stringify(oSessionData);
            
            // Always store in session storage
            sessionStorage.setItem(this._storageKey, sSessionData);
            
            // If persist flag is true, also store in local storage
            if (bPersist) {
                localStorage.setItem(this._storageKey, sSessionData);
            }
        },
        
        /**
         * Start session timeout
         * @private
         */
        _startSessionTimeout() {
            // Clear any existing timeout
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }
            
            // Calculate time until session expires
            const oSessionData = this._getSessionData();
            if (!oSessionData || !oSessionData.expiresAt) {
                return;
            }
            
            const iCurrentTime = new Date().getTime();
            const iTimeRemaining = Math.max(0, oSessionData.expiresAt - iCurrentTime);
            
            // Set timeout to handle session expiry
            this._timeoutId = setTimeout(() => {
                if (!this.isLoggedIn()) {
                    // Publish session expired event
                    sap.ui.getCore().getEventBus().publish("session", "expired", {});
                }
            }, iTimeRemaining);
        }
    };
    
    return SessionManager;
});
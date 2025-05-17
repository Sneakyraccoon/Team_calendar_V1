sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    const SESSION_KEY = "employeeCalendar.session";
    
    /**
     * Session manager utility
     * @namespace
     */
    const SessionManager = {
        /**
         * Check if user is logged in
         * @returns {boolean} True if user is logged in
         * @public
         */
        isLoggedIn() {
            const sessionData = this._getSessionData();
            return !!sessionData && !!sessionData.user;
        },

        /**
         * Get user data from session
         * @returns {object} User data
         * @public
         */
        getUserData() {
            const sessionData = this._getSessionData();
            return sessionData ? sessionData.user : null;
        },

        /**
         * Set user data in session
         * @param {object} userData User data to store
         * @param {boolean} rememberMe Whether to persist the session
         * @public
         */
        setUserData(userData, rememberMe) {
            const sessionData = {
                user: userData,
                timestamp: new Date().getTime(),
                rememberMe: rememberMe
            };
            
            if (rememberMe) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            }
        },

        /**
         * Clear session data and log out user
         * @public
         */
        logout() {
            this.clearSession();
        },

        /**
         * Clear session data
         * @public
         */
        clearSession() {
            localStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_KEY);
        },

        /**
         * Get session data from storage
         * @returns {object} Session data
         * @private
         */
        _getSessionData() {
            let sessionData = JSON.parse(sessionStorage.getItem(SESSION_KEY));
            
            if (!sessionData) {
                sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
            }
            
            if (sessionData && this._isSessionExpired(sessionData)) {
                this.clearSession();
                return null;
            }
            
            return sessionData;
        },

        /**
         * Check if session is expired
         * @param {object} sessionData Session data to check
         * @returns {boolean} True if session is expired
         * @private
         */
        _isSessionExpired(sessionData) {
            const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
            const now = new Date().getTime();
            
            if (!sessionData.rememberMe && (now - sessionData.timestamp > SESSION_TIMEOUT)) {
                return true;
            }
            
            return false;
        }
    };
    
    return SessionManager;
});
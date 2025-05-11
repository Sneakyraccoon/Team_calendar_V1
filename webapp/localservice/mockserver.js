sap.ui.define([
    "sap/ui/core/util/MockServer",
    "sap/base/Log"
], (MockServer, Log) => {
    "use strict";

    return {
        /**
         * Initializes the mock server.
         * @public
         */
        init() {
            // Create mock server for the domain used in the app
            const oMockServer = new MockServer({
                rootUri: "/backend/api/"
            });

            // Configure mock server
            const sLocalServicePath = sap.ui.require.toUrl("com/employeecalendar/localservice");
            
            // Add handlers for API endpoints
            oMockServer.setRequests([
                // Handler for root API endpoint
                {
                    method: "GET",
                    path: "/",
                    response: function(oXhr) {
                        oXhr.respondJSON(200, {}, { success: true, message: "Mock API is running" });
                        return true;
                    }
                },
                // Handler for login
                {
                    method: "POST",
                    path: "/auth/login",
                    response: function(oXhr) {
                        // This would be handled in AuthService.js mock login function
                        oXhr.respondJSON(200, {}, { success: true });
                        return true;
                    }
                }
            ]);
            
            // Initialize the mock server
            try {
                oMockServer.start();
                Log.info("Mock Server started for Employee Calendar application");
            } catch (oError) {
                Log.error("Failed to start mock server", oError);
            }
        }
    };
});
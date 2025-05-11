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
            const sLocalServicePath = sap.ui.require.toUrl("com/employeecalendar/localService");
            
            // Initialize the mock server
            try {
                oMockServer.start();
                Log.info("Mock Server started for Employee Calendar application");
            } catch (oError) {
                Log.error("Failed to start mock server", oError);
            }
            
            // Set property to indicate that we're running with mock data
            this._bIsMocked = true;
        }
    };
});
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
            const sLocalServicePath = sap.ui.require.toUrl("ui5/employeecalendar/localservice");
            
            // Add handlers for API endpoints
            oMockServer.setRequests([
                // Handler for login
                {
                    method: "POST",
                    path: "auth/login",
                    response: (oXhr) => {
                        const oRequestBody = JSON.parse(oXhr.requestBody);
                        
                        // Mock authentication logic
                        if (oRequestBody.employeeId && oRequestBody.password) {
                            oXhr.respondJSON(200, {}, {
                                success: true,
                                user: {
                                    id: oRequestBody.employeeId,
                                    name: "Demo User",
                                    role: "Employee"
                                }
                            });
                        } else {
                            oXhr.respondJSON(401, {}, {
                                success: false,
                                message: "Invalid credentials"
                            });
                        }
                        return true;
                    }
                },
                
                // Handler for employees data
                {
                    method: "GET",
                    path: "employees",
                    response: (oXhr) => {
                        jQuery.ajax({
                            url: sap.ui.require.toUrl("ui5/employeecalendar/localservice/mockdata/employees.json"),
                            dataType: "json",
                            async: false,
                            success: (oResponse) => {
                                oXhr.respondJSON(200, {}, { employees: oResponse });
                            },
                            error: () => {
                                oXhr.respondJSON(500, {}, { success: false, message: "Failed to load employees data" });
                            }
                        });
                        return true;
                    }
                },
                
                // Handler for schedules data
                {
                    method: "GET",
                    path: "schedules",
                    response: (oXhr) => {
                        const sEmployeeId = oXhr.url.split("employeeId=")[1]?.split("&")[0];
                        const sStartDate = decodeURIComponent(oXhr.url.split("startDate=")[1]?.split("&")[0] || "");
                        const sEndDate = decodeURIComponent(oXhr.url.split("endDate=")[1]?.split("&")[0] || "");
                        
                        if (!sEmployeeId || !sStartDate || !sEndDate) {
                            oXhr.respondJSON(400, {}, { 
                                success: false, 
                                message: "Missing required parameters",
                                details: { employeeId: sEmployeeId, startDate: sStartDate, endDate: sEndDate }
                            });
                            return true;
                        }
                        
                        try {
                            jQuery.ajax({
                                url: sap.ui.require.toUrl("ui5/employeecalendar/localservice/mockdata/schedules.json"),
                                dataType: "json",
                                async: false,
                                success: (aSchedules) => {
                                    // Filter schedules by employee ID and date range
                                    const aFilteredSchedules = aSchedules.filter(schedule => {
                                        if (schedule.employeeId !== sEmployeeId) {
                                            return false;
                                        }
                                        
                                        const dScheduleStart = new Date(schedule.startDate);
                                        const dScheduleEnd = new Date(schedule.endDate);
                                        const dRangeStart = new Date(sStartDate);
                                        const dRangeEnd = new Date(sEndDate);
                                        
                                        // Validate dates
                                        if (isNaN(dScheduleStart.getTime()) || isNaN(dScheduleEnd.getTime()) ||
                                            isNaN(dRangeStart.getTime()) || isNaN(dRangeEnd.getTime())) {
                                            return false;
                                        }
                                        
                                        return dScheduleStart <= dRangeEnd && dScheduleEnd >= dRangeStart;
                                    });
                                    
                                    oXhr.respondJSON(200, {}, { 
                                        success: true,
                                        schedules: aFilteredSchedules 
                                    });
                                },
                                error: () => {
                                    oXhr.respondJSON(500, {}, { 
                                        success: false, 
                                        message: "Failed to load schedules data" 
                                    });
                                }
                            });
                        } catch (oError) {
                            oXhr.respondJSON(500, {}, { 
                                success: false, 
                                message: "Error processing schedules",
                                details: oError.message
                            });
                        }
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
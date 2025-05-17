sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel"
], function (BaseObject, Log, JSONModel)  {
    "use strict";
    
    /**
     * Authentication service to handle login, logout and user management
     */
    return BaseObject.extend("ui5.employeecalendar.service.AuthService", {
        /**
         * Constructor
         */
        constructor: function() {
            BaseObject.apply(this, arguments);
            this._initService();
        },
        
        /**
         * Initialize service
         * @private
         */
        _initService() {
            // Base URL for API
            this._baseUrl = "/backend/api";
            
            // Check if running with mock server
            this._bMockMode = window.location.hostname === "localhost" || 
                              window.location.hostname === "127.0.0.1";
        },
        
        /**
         * Authenticate user with credentials
         * @param {string} employeeId - Employee ID
         * @param {string} password - Password
         * @returns {Promise} Promise resolving with authentication result
         * @public
         */
        login(employeeId, password) {
            return new Promise((resolve, reject) => {
                // In a real app, this would be an actual API call
                // For now, we're using the mock server
                jQuery.ajax({
                    url: `${this._baseUrl}/auth/login`,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        employeeId: employeeId,
                        password: password
                    }),
                    success: (response) => {
                        if (response.success) {
                            // Mock user data for demo
                            response.user = {
                                id: employeeId,
                                name: "Demo User",
                                role: "Employee"
                            };
                            resolve(response);
                        } else {
                            reject(new Error(response.message || "Login failed"));
                        }
                    },
                    error: (xhr, status, error) => {
                        reject(new Error(error));
                    }
                });
            });
        },
        
        /**
         * Logout user
         * @returns {Promise} Promise resolving when logout is complete
         * @public
         */
        logout() {
            return new Promise((resolve) => {
                // In a real app, this would be an actual API call
                // For now, we just resolve immediately
                resolve();
            });
        },
        
        /**
         * Get employees list
         * @returns {Promise} Promise resolving with employees data
         * @public
         */
        getEmployees() {
            return new Promise((resolve, reject) => {
                const sUrl = this._bMockMode ? 
                    sap.ui.require.toUrl("ui5/employeecalendar/localservice/mockdata/employees.json") : 
                    `${this._baseUrl}/employees`;
                
                fetch(sUrl)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error("Failed to load employees");
                    })
                    .then(data => {
                        resolve(this._bMockMode ? data : data.employees);
                    })
                    .catch(error => {
                        Log.error("Error loading employees", error);
                        reject(error);
                    });
            });
        },
        
        /**
         * Get schedules for specified employee and date range
         * @param {string} sEmployeeId - Employee ID
         * @param {Date} oStartDate - Start date
         * @param {Date} oEndDate - End date
         * @returns {Promise} Promise resolving with schedule data
         * @public
         */
        getSchedules(sEmployeeId, oStartDate, oEndDate) {
            return new Promise((resolve, reject) => {
                if (this._bMockMode) {
                    // In mock mode, use local JSON data
                    this._mockGetSchedules(sEmployeeId, oStartDate, oEndDate)
                        .then(resolve)
                        .catch(reject);
                } else {
                    // Format dates for API
                    const sStartDate = oStartDate.toISOString().split("T")[0];
                    const sEndDate = oEndDate.toISOString().split("T")[0];
                    
                    const sUrl = `${this._baseUrl}/schedules?employeeId=${sEmployeeId}&startDate=${sStartDate}&endDate=${sEndDate}`;
                    
                    fetch(sUrl)
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                            throw new Error("Failed to load schedules");
                        })
                        .then(data => {
                            resolve(data.schedules);
                        })
                        .catch(error => {
                            Log.error("Error loading schedules", error);
                            reject(error);
                        });
                }
            });
        },
        
        /**
         * Get mock schedules data
         * @param {string} sEmployeeId - Employee ID
         * @param {Date} oStartDate - Start date
         * @param {Date} oEndDate - End date
         * @returns {Promise} Promise resolving with filtered schedules
         * @private
         */
        _mockGetSchedules(sEmployeeId, oStartDate, oEndDate) {
            return new Promise((resolve, reject) => {
                // Simulate network delay
                setTimeout(() => {
                    fetch(sap.ui.require.toUrl("ui5/employeecalendar/localservice/mockdata/schedules.json"))
                        .then(response => response.json())
                        .then(aSchedules => {
                            // Convert start and end dates for comparison
                            const iStartTime = oStartDate.getTime();
                            const iEndTime = oEndDate.getTime();
                            
                            // Filter schedules by employee ID and date range
                            const aFilteredSchedules = aSchedules.filter(schedule => {
                                // Check employee ID
                                if (schedule.employeeId !== sEmployeeId) {
                                    return false;
                                }
                                
                                // Convert schedule dates to timestamp for comparison
                                const oScheduleStart = new Date(schedule.startDate);
                                const oScheduleEnd = new Date(schedule.endDate);
                                
                                // Check if schedule overlaps with selected date range
                                return (oScheduleStart.getTime() <= iEndTime && 
                                        oScheduleEnd.getTime() >= iStartTime);
                            });
                            
                            resolve(aFilteredSchedules);
                        })
                        .catch(error => {
                            Log.error("Error loading mock schedules", error);
                            reject(error);
                        });
                }, 500);
            });
        }
    });
});
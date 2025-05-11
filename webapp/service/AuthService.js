sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log"
], (BaseObject, Log) => {
    "use strict";
    
    /**
     * Authentication service to handle login, logout and user management
     */
    return BaseObject.extend("com.employeecalendar.service.AuthService", {
        /**
         * Constructor
         */
        constructor() {
            BaseObject.apply(this, arguments);
            this._initService();
        },
        
        /**
         * Initialize service
         * @private
         */
        _initService() {
            // Base URL for API
            this._sBaseUrl = "/backend/api";
            
            // Check if running with mock server
            this._bMockMode = window.location.hostname === "localhost" || 
                              window.location.hostname === "127.0.0.1";
        },
        
        /**
         * Authenticate user with credentials
         * @param {string} sEmployeeId - Employee ID
         * @param {string} sPassword - Password
         * @returns {Promise} Promise resolving with authentication result
         * @public
         */
        login(sEmployeeId, sPassword) {
            return new Promise((resolve, reject) => {
                if (this._bMockMode) {
                    // In mock mode, use local JSON data
                    this._mockLogin(sEmployeeId, sPassword)
                        .then(resolve)
                        .catch(reject);
                } else {
                    // In real mode, call API
                    const sUrl = `${this._sBaseUrl}/auth/login`;
                    
                    fetch(sUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            employeeId: sEmployeeId,
                            password: sPassword
                        })
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error("Login failed");
                    })
                    .then(data => {
                        resolve(data);
                    })
                    .catch(error => {
                        Log.error("Login failed", error);
                        reject(error);
                    });
                }
            });
        },
        
        /**
         * Performs mock login with local data
         * @param {string} sEmployeeId - Employee ID
         * @param {string} sPassword - Password
         * @returns {Promise} Promise resolving with authentication result
         * @private
         */
        _mockLogin(sEmployeeId, sPassword) {
            return new Promise((resolve, reject) => {
                // Simulate network delay
                setTimeout(() => {
                    // Load users.json
                    fetch(sap.ui.require.toUrl("com/employeecalendar/localservice/mockdata/users.json"))
                        .then(response => response.json())
                        .then(aUsers => {
                            // Find user with matching credentials
                            const oUser = aUsers.find(user => 
                                user.employeeId === sEmployeeId && 
                                user.password === sPassword
                            );
                            
                            if (oUser) {
                                // Clone user object and remove password
                                const oUserData = { ...oUser };
                                delete oUserData.password;
                                
                                resolve({
                                    success: true,
                                    user: oUserData
                                });
                            } else {
                                resolve({
                                    success: false,
                                    message: "Invalid employee ID or password"
                                });
                            }
                        })
                        .catch(error => {
                            Log.error("Error loading mock users", error);
                            reject(error);
                        });
                }, 1000);
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
                    "localservice/mockdata/employees.json" : 
                    `${this._sBaseUrl}/employees`;
                
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
                    
                    const sUrl = `${this._sBaseUrl}/schedules?employeeId=${sEmployeeId}&startDate=${sStartDate}&endDate=${sEndDate}`;
                    
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
                    fetch(sap.ui.require.toUrl("com/employeecalendar/localservice/mockdata/users.json"))
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
sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "../model/models",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageBox",
    "../service/AuthService",
    "../utils/SessionManager",
    "sap/ui/core/BusyIndicator"
], (BaseController, JSONModel, formatter, models, DateFormat, MessageBox, AuthService, SessionManager, BusyIndicator) => {
    "use strict";

    return BaseController.extend("ui5.employeecalendar.controller.Main", {
        formatter: formatter,

        /**
         * Called when controller is initialized
         * @public
         */
        onInit() {
            // Check if user is logged in
            if (!SessionManager.isLoggedIn()) {
                this.getRouter().navTo("login", {}, true);
                return;
            }
            
            // Initialize models
            this._initModels();
            
            // Initialize services
            this._oAuthService = new AuthService();
            
            // Load employee data
            this._loadEmployees();
            
            // Attach to route matched event
            this.getRouter().getRoute("main").attachPatternMatched(this._onRouteMatched, this);
        },
        
        /**
         * Initialize models for the view
         * @private
         */
        _initModels() {
            // Calendar model
            const oCalendarModel = models.createCalendarModel();
            this.setModel(oCalendarModel, "calendar");
            
            // Employee model
            const oEmployeeModel = models.createEmployeeModel();
            this.setModel(oEmployeeModel, "employee");
        },
        
        /**
         * Handler for route matched
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         */
        _onRouteMatched(oEvent) {
            // Refresh session
            SessionManager.refreshSession();
        },
        
        /**
         * Load employees data
         * @private
         */
        _loadEmployees() {
            BusyIndicator.show(0);
            
            this._oAuthService.getEmployees()
                .then(aEmployees => {
                    const oEmployeeModel = this.getModel("employee");
                    oEmployeeModel.setProperty("/employees", aEmployees);
                    BusyIndicator.hide();
                })
                .catch(oError => {
                    BusyIndicator.hide();
                    MessageBox.error("Failed to load employees data");
                });
        },
        
        /**
         * Load schedules for the selected employee and date range
         * @private
         */
        _loadSchedules() {
            const oEmployeeModel = this.getModel("employee");
            const oSelectedEmployee = oEmployeeModel.getProperty("/selectedEmployee");
            
            if (!oSelectedEmployee) {
                return;
            }
            
            const oCalendarModel = this.getModel("calendar");
            const oStartDate = oCalendarModel.getProperty("/startDate");
            const oEndDate = oCalendarModel.getProperty("/endDate");
            
            BusyIndicator.show(0);
            
            this._oAuthService.getSchedules(oSelectedEmployee.id, oStartDate, oEndDate)
                .then(aSchedules => {
                    // Convert dates from string to Date objects
                    aSchedules.forEach(schedule => {
                        schedule.startDate = new Date(schedule.startDate);
                        schedule.endDate = new Date(schedule.endDate);
                    });
                    
                    // Update model
                    oEmployeeModel.setProperty("/schedules", aSchedules);
                    BusyIndicator.hide();
                })
                .catch(oError => {
                    BusyIndicator.hide();
                    MessageBox.error("Failed to load schedule data");
                });
        },
        
        /**
         * Handler for calendar date range selection
         * @param {sap.ui.base.Event} oEvent Event object
         * @public
         */
        onCalendarSelect(oEvent) {
            const oCalendar = oEvent.getSource();
            const aSelectedDates = oCalendar.getSelectedDates();
            
            if (aSelectedDates.length > 0) {
                const oDateRange = aSelectedDates[0];
                const oStartDate = oDateRange.getStartDate();
                const oEndDate = oDateRange.getEndDate() || oStartDate;
                
                // Calculate difference in days
                const iDiffTime = Math.abs(oEndDate.getTime() - oStartDate.getTime());
                const iDiffDays = Math.ceil(iDiffTime / (1000 * 60 * 60 * 24));
                
                // Check if selected range is more than 60 days (2 months)
                if (iDiffDays > 60) {
                    // Set end date to be 60 days from start date
                    const oNewEndDate = new Date(oStartDate);
                    oNewEndDate.setDate(oStartDate.getDate() + 60);
                    
                    // Update date range
                    oDateRange.setEndDate(oNewEndDate);
                    
                    // Update end date in model
                    const oCalendarModel = this.getModel("calendar");
                    oCalendarModel.setProperty("/endDate", oNewEndDate);
                    
                    // Show message
                    this.showMessage(this.getResourceBundle().getText("maxDateRangeMessage"));
                } else {
                    // Update model with selected dates
                    const oCalendarModel = this.getModel("calendar");
                    oCalendarModel.setProperty("/startDate", oStartDate);
                    oCalendarModel.setProperty("/endDate", oEndDate);
                }
                
                // Load schedules for new date range if an employee is selected
                const oEmployeeModel = this.getModel("employee");
                if (oEmployeeModel.getProperty("/selectedEmployee")) {
                    this._loadSchedules();
                }
            }
        },
        
        /**
         * Handler for employee list item press
         * @param {sap.ui.base.Event} oEvent Event object
         * @public
         */
        onEmployeePress(oEvent) {
            // Get selected employee
            const oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            const oContext = oItem.getBindingContext("employee");
            const oEmployee = oContext.getObject();
            
            // Update selected employee in model
            const oEmployeeModel = this.getModel("employee");
            oEmployeeModel.setProperty("/selectedEmployee", oEmployee);
            
            // Load schedules for selected employee
            this._loadSchedules();
        },

        /**
         * Handler for back navigation to Launchpad
         * @public
         */
        onNavBack() {
            this.getRouter().navTo("launchpad");
        },

        /**
         * Handler for view selection in IconTabBar
         * @param {sap.ui.base.Event} oEvent Event object
         * @public
         */
        onViewSelect(oEvent) {
            const sKey = oEvent.getParameter("key");
            const oViewModel = this.getModel("view") || new JSONModel({
                currentView: sKey,
                showMultiSelect: false,
                showDatePicker: true
            });
            
            if (!this.getModel("view")) {
                this.setModel(oViewModel, "view");
            } else {
                oViewModel.setProperty("/currentView", sKey);
            }
            
            // Update employee list selection mode based on view
            const oEmployeeList = this.byId("employeeList");
            if (oEmployeeList) {
                oEmployeeList.setMode(sKey === "multiPerson" ? "MultiSelect" : "SingleSelectMaster");
            }

            // Update calendar selection mode based on view
            const oCalendar = this.byId("employeeCalendar");
            if (oCalendar) {
                oCalendar.setSingleSelection(sKey === "oneDay" || sKey === "multiPerson");
            }
            
            // Update view based on selection
            switch(sKey) {
                case "multiDay":
                    this._handleMultiDayView();
                    break;
                case "multiPerson":
                    this._handleMultiPersonView();
                    break;
                case "oneDay":
                    this._handleOneDayView();
                    break;
                case "team":
                    this._handleTeamView();
                    break;
            }
        },

        /**
         * Handle Multi-day view for single employee
         * @private
         */
        _handleMultiDayView() {
            const oEmployeeModel = this.getModel("employee");
            const oSelectedEmployee = oEmployeeModel.getProperty("/selectedEmployee");
            
            if (oSelectedEmployee) {
                this._loadSchedules();
            }
        },

        /**
         * Handle Multi-person view for one day
         * @private
         */
        _handleMultiPersonView() {
            const oCalendarModel = this.getModel("calendar");
            const oStartDate = oCalendarModel.getProperty("/startDate");
            
            if (oStartDate) {
                // Set end date same as start date for one-day view
                oCalendarModel.setProperty("/endDate", oStartDate);
                
                // Load schedules for all selected employees
                this._loadMultiPersonSchedules();
            }
        },

        /**
         * Handle One-day view for single employee
         * @private
         */
        _handleOneDayView() {
            const oCalendarModel = this.getModel("calendar");
            const oEmployeeModel = this.getModel("employee");
            const oSelectedEmployee = oEmployeeModel.getProperty("/selectedEmployee");
            const oStartDate = oCalendarModel.getProperty("/startDate");
            
            if (oSelectedEmployee && oStartDate) {
                // Set end date same as start date for one-day view
                oCalendarModel.setProperty("/endDate", oStartDate);
                this._loadSchedules();
            }
        },

        /**
         * Handle Team view
         * @private
         */
        _handleTeamView() {
            const oEmployeeModel = this.getModel("employee");
            const oSelectedEmployee = oEmployeeModel.getProperty("/selectedEmployee");
            
            if (oSelectedEmployee) {
                // Load team members based on selected employee's department
                this._loadTeamMembers(oSelectedEmployee.department);
            }
        },

        /**
         * Load schedules for multiple employees
         * @private
         */
        _loadMultiPersonSchedules() {
            const oEmployeeList = this.byId("employeeList");
            const aSelectedItems = oEmployeeList.getSelectedItems();
            const oCalendarModel = this.getModel("calendar");
            const oStartDate = oCalendarModel.getProperty("/startDate");
            const oEndDate = oCalendarModel.getProperty("/endDate");
            
            if (aSelectedItems.length > 0 && oStartDate && oEndDate) {
                BusyIndicator.show(0);
                
                const aPromises = aSelectedItems.map(oItem => {
                    const oEmployee = oItem.getBindingContext("employee").getObject();
                    return this._oAuthService.getSchedules(oEmployee.id, oStartDate, oEndDate);
                });
                
                Promise.all(aPromises)
                    .then(aResults => {
                        // Combine all schedules with employee information
                        const aSchedules = aResults.reduce((acc, aEmployeeSchedules, index) => {
                            const oEmployee = aSelectedItems[index].getBindingContext("employee").getObject();
                            return acc.concat(aEmployeeSchedules.map(schedule => ({
                                ...schedule,
                                employeeName: oEmployee.name,
                                employeeId: oEmployee.id
                            })));
                        }, []);
                        
                        const oEmployeeModel = this.getModel("employee");
                        oEmployeeModel.setProperty("/schedules", aSchedules);
                        BusyIndicator.hide();
                    })
                    .catch(oError => {
                        BusyIndicator.hide();
                        MessageBox.error("Failed to load schedules");
                    });
            }
        },

        /**
         * Load team members based on department
         * @param {string} sDepartment Department name
         * @private
         */
        _loadTeamMembers(sDepartment) {
            BusyIndicator.show(0);
            
            this._oAuthService.getTeamMembers(sDepartment)
                .then(aTeamMembers => {
                    const oEmployeeModel = this.getModel("employee");
                    oEmployeeModel.setProperty("/teamMembers", aTeamMembers);
                    
                    // Load schedules for all team members
                    const oCalendarModel = this.getModel("calendar");
                    const oStartDate = oCalendarModel.getProperty("/startDate");
                    const oEndDate = oCalendarModel.getProperty("/endDate");
                    
                    if (oStartDate && oEndDate) {
                        return Promise.all(aTeamMembers.map(oMember => 
                            this._oAuthService.getSchedules(oMember.id, oStartDate, oEndDate)
                        ));
                    }
                })
                .then(aSchedules => {
                    if (aSchedules) {
                        const oEmployeeModel = this.getModel("employee");
                        const aTeamMembers = oEmployeeModel.getProperty("/teamMembers");
                        
                        // Combine schedules with employee information
                        const aCombinedSchedules = aSchedules.reduce((acc, aEmployeeSchedules, index) => {
                            const oEmployee = aTeamMembers[index];
                            return acc.concat(aEmployeeSchedules.map(schedule => ({
                                ...schedule,
                                employeeName: oEmployee.name,
                                employeeId: oEmployee.id
                            })));
                        }, []);
                        
                        oEmployeeModel.setProperty("/schedules", aCombinedSchedules);
                    }
                    BusyIndicator.hide();
                })
                .catch(oError => {
                    BusyIndicator.hide();
                    MessageBox.error("Failed to load team data");
                });
        }
    });
});
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], (JSONModel, Device) => {
    "use strict";

    return {
        /**
         * Creates a device model with responsive layout info
         * @returns {sap.ui.model.json.JSONModel} Device model
         * @public
         */
        createDeviceModel() {
            const oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        
        /**
         * Creates a session model
         * @returns {sap.ui.model.json.JSONModel} Session model
         * @public
         */
        createSessionModel() {
            const oModel = new JSONModel({
                isLoggedIn: false,
                user: null
            });
            return oModel;
        },
        
        /**
         * Creates a calendar model with date selection info
         * @returns {sap.ui.model.json.JSONModel} Calendar model
         * @public
         */
        createCalendarModel() {
            // Get current date
            const oCurrentDate = new Date();
            
            // Calculate default end date (1 month from current date)
            const oEndDate = new Date(oCurrentDate);
            oEndDate.setMonth(oEndDate.getMonth() + 1);
            
            const oModel = new JSONModel({
                startDate: oCurrentDate,
                endDate: oEndDate,
                maxDateRange: 60, // Maximum date range in days (approx. 2 months)
                selectedEmployee: null
            });
            
            return oModel;
        },
        
        /**
         * Creates an employee model
         * @returns {sap.ui.model.json.JSONModel} Employee model
         * @public
         */
        createEmployeeModel() {
            const oModel = new JSONModel({
                employees: [],
                selectedEmployee: null,
                schedules: []
            });
            
            return oModel;
        }
    };
});
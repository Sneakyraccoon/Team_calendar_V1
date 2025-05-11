sap.ui.define([], () => {
    "use strict";

    return {
        /**
         * Formats the status type to a UI5 status state
         * @param {string} sStatus - The status string
         * @return {string} sState - The UI5 state
         */
        statusState(sStatus) {
            if (!sStatus) {
                return "None";
            }
            
            switch (sStatus.toLowerCase()) {
                case "work":
                case "regular work":
                    return "Information";
                case "overtime":
                    return "Warning";
                case "vacation":
                    return "Success";
                case "sick":
                case "sick leave":
                    return "Error";
                case "training":
                    return "Warning";
                case "remote":
                case "remote work":
                    return "Information";
                case "business trip":
                    return "Warning";
                default:
                    return "None";
            }
        },
        
        /**
         * Returns an icon based on the employee status
         * @param {string} sStatus - The status string
         * @return {string} sIcon - The icon path
         */
        statusIcon(sStatus) {
            if (!sStatus) {
                return "sap-icon://question-mark";
            }
            
            switch (sStatus.toLowerCase()) {
                case "work":
                case "regular work":
                    return "sap-icon://activity-individual";
                case "overtime":
                    return "sap-icon://overtime";
                case "vacation":
                    return "sap-icon://travel-expense";
                case "sick":
                case "sick leave":
                    return "sap-icon://stethoscope";
                case "training":
                    return "sap-icon://education";
                case "remote":
                case "remote work":
                    return "sap-icon://home";
                case "business trip":
                    return "sap-icon://map";
                default:
                    return "sap-icon://question-mark";
            }
        },
        
        /**
         * Format date range for display
         * @param {Date} oStartDate - The start date
         * @param {Date} oEndDate - The end date
         * @returns {string} Formatted date range
         */
        formatDateRange(oStartDate, oEndDate) {
            if (!oStartDate || !oEndDate) {
                return "";
            }
            
            const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                style: "medium"
            });
            
            return `${oDateFormat.format(oStartDate)} - ${oDateFormat.format(oEndDate)}`;
        },
        
        /**
         * Format date for display
         * @param {string|Date} vDate - The date to format
         * @returns {string} Formatted date
         */
        formatDate(vDate) {
            if (!vDate) {
                return "";
            }
            
            let oDate = vDate;
            if (typeof vDate === "string") {
                oDate = new Date(vDate);
            }
            
            const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                style: "medium"
            });
            
            return oDateFormat.format(oDate);
        },
        
        /**
         * Format hours for display
         * @param {number} iHours - The hours value
         * @returns {string} Formatted hours
         */
        formatHours(iHours) {
            if (iHours === undefined || iHours === null) {
                return "";
            }
            
            return `${iHours} h`;
        }
    };
});
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/core/ComponentContainer"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, History, ComponentContainer) {
    "use strict";

    return Controller.extend("com.myapp.controller.Launchpad", {

        onInit: function () {
            this._initializeModel();
            this._loadUserTiles();
            this._setupRouting();
            this._loadUserInfo();
        },

        /**
         * Initialize the view model
         */
        _initializeModel: function () {
            var oModel = new JSONModel({
                userInfo: {
                    userName: "",
                    welcomeText: "",
                    description: ""
                },
                tiles: [],
                recentTiles: [],
                favoriteTiles: [],
                selectedCategory: "all",
                editMode: false,
                canAddTiles: false,
                canEditTiles: false,
                searchValue: "",
                totalAppsCount: 0,
                notificationsCount: 0,
                menuItems: [
                    {
                        text: "Home",
                        icon: "sap-icon://home",
                        key: "home"
                    },
                    {
                        text: "Settings",
                        icon: "sap-icon://settings",
                        key: "settings"
                    },
                    {
                        text: "Help",
                        icon: "sap-icon://sys-help",
                        key: "help"
                    }
                ]
            });

            this.getView().setModel(oModel);
            
            // Set initial notifications count (this would typically come from a service)
            this._updateNotificationsCount();
        },

        /**
         * Update notifications count
         * @private
         */
        _updateNotificationsCount: function() {
            var oModel = this.getView().getModel();
            // This would typically come from a notification service
            oModel.setProperty("/notificationsCount", "5");
        },

        /**
         * Handle menu item press
         */
        onMenuItemPress: function(oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();

            switch(sKey) {
                case "home":
                    this._loadUserTiles();
                    break;
                case "settings":
                    this.onSettingsPress();
                    break;
                case "help":
                    this.onHelpPress();
                    break;
                default:
                    break;
            }
        },

        /**
         * Handle notifications press
         */
        onNotificationsPress: function(oEvent) {
            // Implementation for notifications
            MessageToast.show("Notifications clicked - Implementation pending");
        },

        /**
         * Handle product switcher press
         */
        onProductSwitcherPress: function(oEvent) {
            // Implementation for product switcher
            MessageToast.show("Product Switcher clicked - Implementation pending");
        },

        /**
         * Handle home icon press
         */
        onHomeIconPress: function(oEvent) {
            this._loadUserTiles();
            this.getView().getModel().setProperty("/selectedCategory", "all");
        },

        /**
         * Load user information and permissions
         */
        _loadUserInfo: function () {
            // This would typically come from a service
            var oModel = this.getView().getModel();
            var oUserService = this.getOwnerComponent().getUserService();
            
            oUserService.getCurrentUser().then(function (oUser) {
                oModel.setProperty("/userInfo", {
                    userName: oUser.name,
                    welcomeText: "Welcome, " + oUser.name,
                    description: "Role: " + oUser.role
                });
                
                // Set permissions based on user role
                oModel.setProperty("/canAddTiles", oUser.permissions.canAddTiles);
                oModel.setProperty("/canEditTiles", oUser.permissions.canEditTiles);
            }).catch(function (oError) {
                console.error("Error loading user info:", oError);
            });
        },

        /**
         * Load tiles based on user role and permissions
         */
        _loadUserTiles: function () {
            var oModel = this.getView().getModel();
            var oTileService = this.getOwnerComponent().getTileService();

            oTileService.getUserTiles().then(function (aTiles) {
                oModel.setProperty("/tiles", aTiles);
                oModel.setProperty("/totalAppsCount", aTiles.length);
            }).catch(function (oError) {
                MessageBox.error("Failed to load applications: " + oError.message);
            });

            // Load recent tiles
            oTileService.getRecentTiles().then(function (aRecentTiles) {
                oModel.setProperty("/recentTiles", aRecentTiles);
            });
            
            // Load favorite tiles
            oTileService.getFavoriteTiles().then(function (aFavoriteTiles) {
                oModel.setProperty("/favoriteTiles", aFavoriteTiles);
            });
        },

        /**
         * Setup routing for tile navigation
         */
        _setupRouting: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            
            // Listen for route matched events
            oRouter.getRoute("launchpad").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Handle route matched
         */
        _onRouteMatched: function (oEvent) {
            // Refresh tiles when returning to launchpad
            this._loadUserTiles();
        },

        /**
         * Handle tile press - navigate to the component/app
         */
        onTilePress: function (oEvent) {
            var oTile = oEvent.getSource();
            var oBindingContext = oTile.getBindingContext();
            var oTileData = oBindingContext.getObject();

            this._addToRecentTiles(oTileData);
            this._navigateToApp(oTileData);
        },

        /**
         * Navigate to the selected application
         */
        _navigateToApp: function (oTileData) {
            var oRouter = this.getOwnerComponent().getRouter();

            switch (oTileData.navigationType) {
                case "component":
                    this._loadComponent(oTileData);
                    break;
                case "route":
                    oRouter.navTo(oTileData.targetRoute, oTileData.routeParameters || {});
                    break;
                case "url":
                    this._openExternalUrl(oTileData.targetUrl);
                    break;
                default:
                    MessageToast.show("Navigation type not supported");
            }
        },

        /**
         * Load UI5 Component dynamically
         */
        _loadComponent: function (oTileData) {
            var that = this;
            
            sap.ui.component({
                name: oTileData.componentName,
                async: true,
                settings: oTileData.componentSettings || {}
            }).then(function (oComponent) {
                // Create component container
                var oComponentContainer = new ComponentContainer({
                    component: oComponent,
                    height: "100%"
                });

                // Navigate to component view
                var oRouter = that.getOwnerComponent().getRouter();
                oRouter.navTo("componentView", {
                    componentId: oTileData.id
                });

                // Store component reference for cleanup
                that._currentComponent = oComponent;
                
            }).catch(function (oError) {
                MessageBox.error("Failed to load component: " + oError.message);
            });
        },

        /**
         * Open external URL
         */
        _openExternalUrl: function (sUrl) {
            window.open(sUrl, "_blank");
        },

        /**
         * Add tile to recent tiles
         */
        _addToRecentTiles: function (oTileData) {
            var oModel = this.getView().getModel();
            var aRecentTiles = oModel.getProperty("/recentTiles");
            
            // Remove if already exists
            aRecentTiles = aRecentTiles.filter(function (oTile) {
                return oTile.id !== oTileData.id;
            });
            
            // Add to beginning
            aRecentTiles.unshift(oTileData);
            
            // Keep only last 5
            if (aRecentTiles.length > 5) {
                aRecentTiles = aRecentTiles.slice(0, 5);
            }
            
            oModel.setProperty("/recentTiles", aRecentTiles);
            
            // Persist to service
            var oTileService = this.getOwnerComponent().getTileService();
            oTileService.updateRecentTiles(aRecentTiles);
        },

        /**
         * Handle category filter change
         */
        onCategoryChange: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("key");
            var oModel = this.getView().getModel();
            
            oModel.setProperty("/selectedCategory", sSelectedKey);
            this._applyFilters();
        },

        /**
         * Handle tile search
         */
        onSearchTiles: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oModel = this.getView().getModel();
            
            oModel.setProperty("/searchValue", sQuery);
            this._applyFilters();
        },

        /**
         * Handle live search
         */
        onSearchLiveChange: function (oEvent) {
            var sValue = oEvent.getParameter("newValue");
            var oModel = this.getView().getModel();
            
            oModel.setProperty("/searchValue", sValue);
            this._applyFilters();
        },

        /**
         * Apply filters to tiles
         */
        _applyFilters: function () {
            var oModel = this.getView().getModel();
            var sCategory = oModel.getProperty("/selectedCategory");
            var sSearchValue = oModel.getProperty("/searchValue");
            var oTilesGrid = this.byId("tilesGrid");
            var oBinding = oTilesGrid.getBinding("content");
            
            if (!oBinding) {
                return;
            }

            var aFilters = [];
            
            // Always filter by visible
            aFilters.push(new Filter("visible", FilterOperator.EQ, true));
            
            // Category filter
            if (sCategory && sCategory !== "all") {
                aFilters.push(new Filter("category", FilterOperator.EQ, sCategory));
            }
            
            // Search filter
            if (sSearchValue) {
                var aSearchFilters = [
                    new Filter("title", FilterOperator.Contains, sSearchValue),
                    new Filter("subtitle", FilterOperator.Contains, sSearchValue),
                    new Filter("description", FilterOperator.Contains, sSearchValue)
                ];
                aFilters.push(new Filter(aSearchFilters, false)); // OR condition
            }
            
            oBinding.filter(aFilters);
        },

        /**
         * Toggle edit mode
         */
        onToggleEditMode: function () {
            var oModel = this.getView().getModel();
            var bCurrentEditMode = oModel.getProperty("/editMode");
            
            oModel.setProperty("/editMode", !bCurrentEditMode);
            
            if (!bCurrentEditMode) {
                MessageToast.show("Edit mode enabled. You can now rearrange tiles.");
            } else {
                MessageToast.show("Edit mode disabled.");
                this._saveTileArrangement();
            }
        },

        /**
         * Save tile arrangement
         */
        _saveTileArrangement: function () {
            var oTilesGrid = this.byId("tilesGrid");
            var aContent = oTilesGrid.getContent();
            var aTileOrder = [];
            
            aContent.forEach(function (oTile, iIndex) {
                if (oTile.getMetadata().getName() === "sap.m.GenericTile") {
                    var oContext = oTile.getBindingContext();
                    if (oContext) {
                        var oTileData = oContext.getObject();
                        aTileOrder.push({
                            id: oTileData.id,
                            order: iIndex
                        });
                    }
                }
            });
            
            // Save to service
            var oTileService = this.getOwnerComponent().getTileService();
            oTileService.saveTileOrder(aTileOrder).then(function () {
                MessageToast.show("Tile arrangement saved.");
            }).catch(function (oError) {
                MessageBox.error("Failed to save arrangement: " + oError.message);
            });
        },

        /**
         * Handle tile deletion
         */
        onTileDelete: function (oEvent) {
            var oTile = oEvent.getParameter("tile");
            var oContext = oTile.getBindingContext();
            var oTileData = oContext.getObject();
            
            MessageBox.confirm("Remove '" + oTileData.title + "' from your launchpad?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._removeTile(oTileData);
                    }
                }.bind(this)
            });
        },

        /**
         * Remove tile from user's launchpad
         */
        _removeTile: function (oTileData) {
            var oTileService = this.getOwnerComponent().getTileService();
            
            oTileService.removeTileFromUser(oTileData.id).then(function () {
                MessageToast.show("Tile removed from launchpad.");
                this._loadUserTiles(); // Refresh
            }.bind(this)).catch(function (oError) {
                MessageBox.error("Failed to remove tile: " + oError.message);
            });
        },

        /**
         * Handle add new tile
         */
        onAddTilePress: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("tileManagement");
        },

        /**
         * Handle tile action button
         */
        onTileAction: function (oEvent) {
            var oTile = oEvent.getSource().getParent();
            var oContext = oTile.getBindingContext();
            var oTileData = oContext.getObject();
            
            // Show action menu
            this._showTileActionMenu(oEvent.getSource(), oTileData);
        },

        /**
         * Show tile action menu
         */
        _showTileActionMenu: function (oButton, oTileData) {
            if (!this._oTileActionMenu) {
                this._oTileActionMenu = new sap.m.Menu({
                    items: [
                        new sap.m.MenuItem({
                            text: "Open in New Window",
                            icon: "sap-icon://open-command-field",
                            press: this._onOpenInNewWindow.bind(this)
                        }),
                        new sap.m.MenuItem({
                            text: "Add to Favorites",
                            icon: "sap-icon://favorite",
                            press: this._onAddToFavorites.bind(this)
                        }),
                        new sap.m.MenuItem({
                            text: "Tile Information",
                            icon: "sap-icon://hint",
                            press: this._onShowTileInfo.bind(this)
                        })
                    ]
                });
            }
            
            // Store current tile data
            this._currentActionTile = oTileData;
            
            // Open menu
            this._oTileActionMenu.openBy(oButton);
        },

        /**
         * Open tile in new window
         */
        _onOpenInNewWindow: function () {
            if (this._currentActionTile) {
                // Implementation depends on tile type
                MessageToast.show("Opening " + this._currentActionTile.title + " in new window");
            }
        },

        /**
         * Add tile to favorites
         */
        _onAddToFavorites: function () {
            if (this._currentActionTile) {
                var oTileService = this.getOwnerComponent().getTileService();
                oTileService.addToFavorites(this._currentActionTile.id).then(function () {
                    MessageToast.show("Added to favorites");
                });
            }
        },

        /**
         * Show tile information
         */
        _onShowTileInfo: function () {
            if (this._currentActionTile) {
                MessageBox.information(
                    "Description: " + this._currentActionTile.description + "\n" +
                    "Category: " + this._currentActionTile.category + "\n" +
                    "Version: " + this._currentActionTile.version,
                    {
                        title: this._currentActionTile.title
                    }
                );
            }
        },

        /**
         * Handle settings button
         */
        onSettingsPress: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("settings");
        },

        /**
         * Handle user menu button
         */
        onUserMenuPress: function () {
            // Show user menu
            if (!this._oUserMenu) {
                this._oUserMenu = new sap.m.Menu({
                    items: [
                        new sap.m.MenuItem({
                            text: "Profile",
                            icon: "sap-icon://person-placeholder",
                            press: function () {
                                this.getOwnerComponent().getRouter().navTo("profile");
                            }.bind(this)
                        }),
                        new sap.m.MenuItem({
                            text: "Settings",
                            icon: "sap-icon://action-settings",
                            press: function () {
                                this.getOwnerComponent().getRouter().navTo("settings");
                            }.bind(this)
                        }),
                        new sap.m.MenuItem({
                            text: "Logout",
                            icon: "sap-icon://log",
                            press: this._onLogout.bind(this)
                        })
                    ]
                });
            }
            
            this._oUserMenu.openBy(this.byId("userMenuBtn"));
        },

        /**
         * Handle logout
         */
        _onLogout: function () {
            MessageBox.confirm("Are you sure you want to logout?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        // Perform logout
                        this.getOwnerComponent().logout();
                    }
                }.bind(this)
            });
        },

        /**
         * Handle help button
         */
        onHelpPress: function () {
            MessageBox.information("Launchpad Help:\n\n" +
                "• Click tiles to open applications\n" +
                "• Use search to find specific apps\n" +
                "• Filter by category using the buttons\n" +
                "• Enable edit mode to rearrange tiles\n" +
                "• Use action buttons for additional options");
        },

        /**
         * Refresh tiles data
         */
        onRefreshTiles: function () {
            MessageToast.show("Refreshing applications...");
            this._loadUserTiles();
        },

        /**
         * Remove tile from favorites
         */
        onRemoveFromFavorites: function (oEvent) {
            var oTile = oEvent.getSource().getParent();
            var oContext = oTile.getBindingContext();
            var oTileData = oContext.getObject();
            
            var oTileService = this.getOwnerComponent().getTileService();
            oTileService.removeFromFavorites(oTileData.id).then(function () {
                MessageToast.show("Removed from favorites");
                this._loadUserTiles(); // Refresh to update favorites
            }.bind(this));
        },

        /**
         * Cleanup when controller is destroyed
         */
        onExit: function () {
            if (this._oTileActionMenu) {
                this._oTileActionMenu.destroy();
            }
            if (this._oUserMenu) {
                this._oUserMenu.destroy();
            }
            if (this._currentComponent) {
                this._currentComponent.destroy();
            }
        },

        // ========================================
        // FORMATTER FUNCTIONS
        // ========================================

        /**
         * Format visibility for image content
         */
        formatImageVisible: function(sIconSrc, sNumericValue) {
            return sIconSrc && sIconSrc !== "" && !sNumericValue;
        },

        /**
         * Format visibility for numeric content
         */
        formatNumericVisible: function(sNumericValue) {
            return sNumericValue !== undefined && sNumericValue !== "";
        },

        /**
         * Format visibility for delete button
         */
        formatDeleteVisible: function(bEditMode, bRemovable) {
            return bEditMode && bRemovable;
        },

        /**
         * Format visibility for arrays (recentTiles, favoriteTiles)
         */
        formatArrayVisible: function(aArray) {
            return aArray && aArray.length > 0;
        },

        /**
         * Format total apps text
         */
        formatTotalAppsText: function(sTotalAppsText, iCount) {
            return sTotalAppsText + ": " + (iCount || 0);
        },

        /**
         * Format edit mode button text
         */
        formatEditModeText: function(bEditMode, sEditModeText, sDoneEditingText) {
            return bEditMode ? sDoneEditingText : sEditModeText;
        },

        /**
         * Format edit mode button type
         */
        formatEditModeType: function(bEditMode) {
            return bEditMode ? "Emphasized" : "Default";
        }

    });
});
function RoutesTab(id)
{
    Tab.call(this, id, Constants.URL__ROUTES_VIEW_MODEL);
}

RoutesTab.prototype = new Tab();

RoutesTab.prototype.constructor = RoutesTab;

RoutesTab.prototype.checkboxClickHandler = function(event)
{
    event.stopPropagation();
};

RoutesTab.prototype.getInitialSort = function()
{
    return [[1, "asc"]];
};

RoutesTab.prototype.getColumns = function()
{
    return [
               {
                   "sTitle":    "&nbsp;",
                   "sWidth":    "2px",
                   "sClass":    "cellCenterAlign",
                   "bSortable": false,
                   "mRender":   function(value, type, item)
                   {
                       var name = item[1];
                       if (item[3] != null)
                       {
                           name += "." + item[3];
                       }
                       
                       return "<input type='checkbox' name='" + escape(name) + "' value='" + value + "' onclick='RoutesTab.prototype.checkboxClickHandler(event)'></input>";
                   }
               },
               {
                   "sTitle":  "Host",
                   "sWidth":  "200px",
                   "mRender": Format.formatHostName
               },
               {
                   "sTitle": "GUID",
                   "sWidth": "200px",
                   "mRender": Format.formatString
               },
               {
                   "sTitle":  "Domain",
                   "sWidth":  "200px",
                   "mRender": Format.formatDomainName
               },
               {
                   "sTitle":  "Created",
                   "sWidth":  "180px",
                   "mRender": Format.formatString
               },
               {
                   "sTitle":  "Updated",
                   "sWidth":  "180px",
                   "mRender": Format.formatString
               },
               {
                   "sTitle":  "Target",
                   "sWidth":  "200px",
                   "sClass":  "cellLeftAlign",
                   "mRender": Format.formatTarget
               },
               {
                   "sTitle":  "Application",
                   "sWidth":  "200px",
                   "sClass":  "cellLeftAlign",
                   "mRender": Format.formatApplications
               }
           ];
};

RoutesTab.prototype.getActions = function()
{
    return [
               {
                   text: "Delete",
                   click: $.proxy(function()
                   {
                       this.deleteRoutes();
                   }, 
                   this)
               }
           ];
};

RoutesTab.prototype.clickHandler = function()
{
    this.itemClicked(-1, 2);
};

RoutesTab.prototype.showDetails = function(table, objects, row)
{
    var domain       = objects.domain;
    var route        = objects.route;
    var organization = objects.organization;
    var space        = objects.space;

    this.addJSONDetailsLinkRow(table, "Host", Format.formatString(row[1]), objects, true);
    this.addPropertyRow(table, "GUID", Format.formatString(route.guid));
    
    if (domain != null)
    {
        this.addFilterRow(table, "Domain", Format.formatStringCleansed(domain.name), domain.guid, AdminUI.showDomains);
    }

    this.addPropertyRow(table, "Created", Format.formatDateString(row[4]));
    this.addRowIfValue(this.addPropertyRow, table, "Updated", Format.formatDateString, route.updated_at);

    if (row[7] != null)
    {
        this.addFilterRow(table, "Applications", Format.formatNumber(row[7].length), row[1] + "." + Format.formatString(row[3]), AdminUI.showApplications);
    }

    if (space != null)
    {
        this.addFilterRow(table, "Space", Format.formatStringCleansed(space.name), space.guid, AdminUI.showSpaces);
    }

    if (organization != null)
    {
        this.addFilterRow(table, "Organization", Format.formatStringCleansed(organization.name), organization.guid, AdminUI.showOrganizations);
    }
};

RoutesTab.prototype.deleteRoutes = function()
{
    var routes = this.getSelectedRoutes();

    if (!routes || routes.length == 0)
    {
        return;
    }

    AdminUI.showModalDialogConfirmation("Are you sure you want to delete the selected routes?",
                                        "Delete",
                                        function()
                                        {
                                            var processed = 0;
                                            
                                            var errorRoutes = [];
                                        
                                            AdminUI.showModalDialogProgress("Deleting Routes");
                                        
                                            for (var routeIndex = 0; routeIndex < routes.length; routeIndex++)
                                            {
                                                var route = routes[routeIndex];
                                                
                                                var deferred = $.ajax({
                                                                          type:      "DELETE",
                                                                          url:       Constants.URL__ROUTES + "/" + route.guid,
                                                                          // Need route host inside the fail method
                                                                          routeHost: route.host
                                                                      });
                                                
                                                deferred.fail(function(xhr, status, error)
                                                {
                                                    errorRoutes.push({
                                                                         label: this.routeHost,
                                                                         xhr:   xhr
                                                                     });
                                                });
                                                
                                                deferred.always(function(xhr, status, error)
                                                {
                                                    processed++;
                                                    
                                                    if (processed == routes.length)
                                                    {
                                                        if (errorRoutes.length > 0)
                                                        {
                                                            AdminUI.showModalDialogErrorTable(errorRoutes);
                                                        }
                                                        else
                                                        {
                                                            AdminUI.showModalDialogSuccess();
                                                        }
                                                
                                                        AdminUI.refresh();
                                                    }
                                                });
                                            }
                                        });
};

RoutesTab.prototype.getSelectedRoutes = function()
{
    var checkedRows = $("input:checked", this.table.fnGetNodes());

    if (checkedRows.length == 0)
    {
        AdminUI.showModalDialogError("Please select at least one row!");
        
        return null;
    }

    var routes = [];

    for (var checkedIndex = 0; checkedIndex < checkedRows.length; checkedIndex++)
    {
        var checkedRow = checkedRows[checkedIndex];
        
        routes.push({
                        host: unescape(checkedRow.name),
                        guid: checkedRow.value
                    });
    }

    return routes;
};

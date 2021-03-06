
function SpaceRolesTab(id)
{
    Tab.call(this, id, Constants.URL__SPACE_ROLES_VIEW_MODEL);
}

SpaceRolesTab.prototype = new Tab();

SpaceRolesTab.prototype.constructor = SpaceRolesTab;

SpaceRolesTab.prototype.getInitialSort = function()
{
    return [[3, "asc"]];
};

SpaceRolesTab.prototype.getColumns = function()
{
    return [
               {
                   "sTitle":    "&nbsp;",
                   "sWidth":    "2px",
                   "sClass":    "cellCenterAlign",
                   "bSortable": false,
                   "mRender":   function(value, type, item)
                   {
                       var name = "";
                       if (item[3] != null)
                       {
                           name += item[3];
                       }
                       else
                       {
                           name += item[1];
                       }
                       name += "/" + item[6] + "/" + item[4];
                       
                       return "<input type='checkbox' name='" + escape(name) + "' value='" + value + "' onclick='SpaceRolesTab.prototype.checkboxClickHandler(event)'></input>";
                   }
               },
               {
                   "sTitle":  "Name",
                   "sWidth":  "200px",
                   "mRender": Format.formatSpaceName
               },
               {
                   "sTitle": "GUID",
                   "sWidth": "200px",
                   "mRender": Format.formatString
               },
               {
                   "sTitle":  "Target",
                   "sWidth":  "200px",
                   "mRender": Format.formatTarget
               },
               {
                   "sTitle": "Name",
                   "sWidth": "200px",
                   "mRender": Format.formatUserString
               },
               {
                   "sTitle": "GUID",
                   "sWidth": "200px",
                   "mRender": Format.formatString
               },
               {
                   "sTitle": "Role",
                   "sWidth": "200px",
                   "mRender": Format.formatString
               }        
           ];
};

SpaceRolesTab.prototype.getActions = function()
{
    return [
               {
                   text: "Delete",
                   click: $.proxy(function()
                   {
                       this.deleteSpaceRoles();
                   },
                   this)
               }
           ];
};

SpaceRolesTab.prototype.checkboxClickHandler = function(event)
{
    event.stopPropagation();
};

SpaceRolesTab.prototype.clickHandler = function()
{
    this.itemClicked(-1, 0);
};

SpaceRolesTab.prototype.showDetails = function(table, objects, row)
{
    var organization = objects.organization;
    var space        = objects.space;
    var user_uaa     = objects.user_uaa;
    
    var spaceLink = this.createFilterLink(Format.formatStringCleansed(space.name), space.guid, AdminUI.showSpaces);
    var details = document.createElement("div");
    $(details).append(spaceLink);
    $(details).append(this.createJSONDetailsLink(objects));
    
    this.addRow(table, "Space", details, true);
    
    this.addPropertyRow(table, "Space GUID", Format.formatString(space.guid));
    
    if (organization != null)
    {
        this.addFilterRow(table, "Organization", Format.formatStringCleansed(organization.name), organization.guid, AdminUI.showOrganizations);
    }
    
    this.addFilterRow(table, "User", Format.formatStringCleansed(user_uaa.username), user_uaa.id, AdminUI.showUsers);
    this.addPropertyRow(table, "User GUID", Format.formatString(user_uaa.id));
    this.addPropertyRow(table, "Role", Format.formatString(row[6]));
};

SpaceRolesTab.prototype.deleteSpaceRoles = function()
{
    var spaceRoles = this.getSelectedSpaceRoles();

    if (!spaceRoles || spaceRoles.length == 0)
    {
        return;
    }

    AdminUI.showModalDialogConfirmation("Are you sure you want to delete the selected space roles?",
                                        "Delete",
                                        function()
                                        {
                                            AdminUI.showModalDialogProgress("Deleting Space Roles");
        
                                            var processed = 0;
                                            
                                            var errorSpaceRoles = [];
                                        
                                            for (var spaceRoleIndex = 0; spaceRoleIndex < spaceRoles.length; spaceRoleIndex++)
                                            {
                                                var spaceRole = spaceRoles[spaceRoleIndex];
                                                
                                                var deferred = $.ajax({
                                                                          type:      "DELETE",
                                                                          url:       Constants.URL__SPACES + "/" + spaceRole.guid,
                                                                          // Need space role path inside the fail method
                                                                          spacePath: spaceRole.path
                                                                      });
                                                
                                                deferred.fail(function(xhr, status, error)
                                                {
                                                    errorSpaceRoles.push({
                                                                             label: this.spacePath,
                                                                             xhr:   xhr
                                                                         });
                                                });
                                                
                                                deferred.always(function(xhr, status, error)
                                                {
                                                    processed++;
                                                    
                                                    if (processed == spaceRoles.length)
                                                    {
                                                        if (errorSpaceRoles.length > 0)
                                                        {
                                                            AdminUI.showModalDialogErrorTable(errorSpaceRoles);
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

SpaceRolesTab.prototype.getSelectedSpaceRoles = function()
{
    var checkedRows = $("input:checked", this.table.fnGetNodes());

    if (checkedRows.length == 0)
    {
        AdminUI.showModalDialogError("Please select at least one row!");
        
        return null;
    }

    var spaceRoles = [];

    for (var checkedIndex = 0; checkedIndex < checkedRows.length; checkedIndex++)
    {
        var checkedRow = checkedRows[checkedIndex];
        
        spaceRoles.push({
                            path: unescape(checkedRow.name),
                            guid: checkedRow.value
                        });
    }

    return spaceRoles;
};

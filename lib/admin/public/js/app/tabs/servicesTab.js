function ServicesTab(id) 
{
    Tab.call(this, id, Constants.URL__SERVICES_VIEW_MODEL);
}

ServicesTab.prototype = new Tab();

ServicesTab.prototype.constructor = ServicesTab;

ServicesTab.prototype.getInitialSort = function() 
{
    return [[1, "asc"]];
};

ServicesTab.prototype.getColumns = function() 
{
    return [
                {
                    "sTitle": "Provider",
                    "sWidth": "100px",
                    "mRender": Format.formatServiceString
                },
                {
                    "sTitle":  "Label",
                    "sWidth":  "200px",
                    "mRender": Format.formatServiceString
                },
                {
                    "sTitle": "GUID",
                    "sWidth": "200px",
                    "mRender": Format.formatString
                },
                {
                    "sTitle": "Version",
                    "sWidth": "100px",
                    "mRender": Format.formatServiceString
                },
                {
                    "sTitle": "Created",
                    "sWidth": "170px",
                    "mRender": Format.formatString
                },
                {
                    "sTitle": "Updated",
                    "sWidth": "170px",
                    "mRender": Format.formatString
                },
                {
                    "sTitle": "Active",
                    "sWidth": "70px",
                    "mRender": Format.formatBoolean
                },
                {
                    "sTitle":  "Bindable",
                    "sWidth":  "70px",
                    "mRender": Format.formatBoolean
                },
                {
                    "sTitle":  "Plan Updateable",
                    "sWidth":  "70px",
                    "mRender": Format.formatBoolean
                },
                {
                    "sTitle":  "Service Plans",
                    "sWidth":  "80px",
                    "sClass":  "cellRightAlign",
                    "mRender": Format.FormatNumber
                },
                {
                    "sTitle":  "Service Instances",
                    "sWidth":  "80px",
                    "sClass":  "cellRightAlign",
                    "mRender": Format.FormatNumber
                },
                {
                    "sTitle":  "Service Bindings",
                    "sWidth":  "80px",
                    "sClass":  "cellRightAlign",
                    "mRender": Format.FormatNumber
                },
                {
                    "sTitle":  "Name",
                    "sWidth":  "200px",
                    "mRender": Format.formatServiceString
                },
                {
                    "sTitle":  "GUID",
                    "sWidth":  "200px",
                    "mRender": Format.formatString
                },
                {
                    "sTitle":  "Created",
                    "sWidth":  "170px",
                    "mRender": Format.formatString
                },
                {
                    "sTitle": "Updated",
                    "sWidth": "170px",
                    "mRender": Format.formatString
                }
            ];
};

ServicesTab.prototype.clickHandler = function()
{
    this.itemClicked(-1, 2);
};

ServicesTab.prototype.showDetails = function(table, objects, row)
{
    var service       = objects.service;
    var serviceBroker = objects.serviceBroker;

    this.addRowIfValue(this.addPropertyRow, table, "Service Provider", Format.formatString, service.provider);
    this.addJSONDetailsLinkRow(table, "Service Label", Format.formatString(service.label), objects, true);
    this.addPropertyRow(table, "Service GUID", Format.formatString(service.guid));
    this.addRowIfValue(this.addPropertyRow, table, "Service Version", Format.formatString, service.version);
    this.addPropertyRow(table, "Service Created", Format.formatDateString(service.created_at));
    this.addRowIfValue(this.addPropertyRow, table, "Service Updated", Format.formatDateString, service.updated_at);
    this.addPropertyRow(table, "Service Active", Format.formatBoolean(service.active));
    this.addPropertyRow(table, "Service Bindable", Format.formatBoolean(service.bindable));
    this.addRowIfValue(this.addPropertyRow, table, "Service Plan Updateable", Format.formatBoolean, service.plan_updateable);
    this.addPropertyRow(table, "Service Description", Format.formatString(service.description));
    this.addRowIfValue(this.addPropertyRow, table, "Service Unique ID", Format.formatString, service.unique_id);
    this.addRowIfValue(this.addPropertyRow, table, "Service URL", Format.formatString, service.url);
    
    if (service.tags != null)
    {
        try
        {
            var serviceTags = jQuery.parseJSON(service.tags);
            
            if (serviceTags != null && serviceTags.length > 0)
            {
                for (var serviceTagIndex = 0; serviceTagIndex < serviceTags.length; serviceTagIndex++)
                {
                    var serviceTag = serviceTags[serviceTagIndex];
    
                    this.addPropertyRow(table, "Service Tag", Format.formatString(serviceTag));
                }
            }
        }
        catch (error)
        {
        }
    }
    
    // Documentation URL for v1 service
    if (service.documentation_url != null)
    {
        this.addURIRow(table, "Service Documentation URL", service.documentation_url);
    }

    // Info URL for v1 service
    if (service.info_url != null)
    {
        this.addURIRow(table, "Service Info URL", service.info_url);
    }

    if (service.extra != null)
    {
        try
        {
            var serviceExtra = jQuery.parseJSON(service.extra);
            
            this.addRowIfValue(this.addPropertyRow, table, "Service Display Name", Format.formatString, serviceExtra.displayName);
            this.addRowIfValue(this.addPropertyRow, table, "Service Provider Display Name", Format.formatString, serviceExtra.providerDisplayName);
            this.addRowIfValue(this.addFormattableTextRow, table, "Service Icon", Format.formatIconImage, serviceExtra.imageUrl, "service icon", "flot:left;");
            this.addRowIfValue(this.addPropertyRow, table, "Service Long Description", Format.formatString, serviceExtra.longDescription);
            
            if (serviceExtra.documentationUrl != null)
            {
                this.addURIRow(table, "Service Documentation URL", serviceExtra.documentationUrl);
            }
            
            if (serviceExtra.supportUrl != null)
            {
                this.addURIRow(table, "Service Support URL", serviceExtra.supportUrl);
            }
        }
        catch (error)
        {
        }
    }
    
    if (row[9] != null)
    {
        this.addFilterRow(table, "Service Plans", Format.formatNumber(row[9]), service.guid, AdminUI.showServicePlans);
    }
    
    if (row[10] != null)
    {
        this.addFilterRow(table, "Service Instances", Format.formatNumber(row[10]), service.guid, AdminUI.showServiceInstances);
    }
    
    if (row[11] != null)
    {
        this.addFilterRow(table, "Service Bindings", Format.formatNumber(row[11]), service.guid, AdminUI.showServiceBindings);
    }
    
    if (serviceBroker != null)
    {
        this.addFilterRow(table, "Service Broker Name", Format.formatStringCleansed(serviceBroker.name), serviceBroker.guid, AdminUI.showServiceBrokers);
        this.addPropertyRow(table, "Service Broker GUID", Format.formatString(serviceBroker.guid));
        this.addPropertyRow(table, "Service Broker Created", Format.formatDateString(serviceBroker.created_at));
        this.addRowIfValue(this.addPropertyRow, table, "Service Broker Updated", Format.formatDateString, serviceBroker.updated_at);
    }
};

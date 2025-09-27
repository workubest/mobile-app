import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  Zap,
  Users,
  Settings,
  MessageSquare,
  X
} from 'lucide-react';
import eeuLogo from 'figma:asset/a7b96e6fbe59cc65b1f1fae75f58ca6158a2d650.png';

interface SystemAlertsProps {
  onBack: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function SystemAlerts({ onBack, onNavigate }: SystemAlertsProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const alerts = [
    {
      id: 'ALERT-2024-001',
      type: 'critical',
      category: 'outage',
      title: 'Critical Power Outage - Bole District',
      message: 'Major transformer failure affecting 500+ customers in Bole District. Emergency crews dispatched.',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      actionRequired: true,
      source: 'Outage Management System'
    },
    {
      id: 'ALERT-2024-002',
      type: 'warning',
      category: 'maintenance',
      title: 'Scheduled Maintenance Reminder',
      message: 'Planned maintenance for Kirkos substation scheduled for tomorrow 8:00 AM - 12:00 PM.',
      timestamp: '2024-01-15T09:15:00Z',
      read: true,
      actionRequired: false,
      source: 'Maintenance Scheduler'
    },
    {
      id: 'ALERT-2024-003',
      type: 'info',
      category: 'system',
      title: 'System Update Completed',
      message: 'CMS system update has been successfully completed. All services are now running on the latest version.',
      timestamp: '2024-01-15T08:45:00Z',
      read: true,
      actionRequired: false,
      source: 'System Administrator'
    },
    {
      id: 'ALERT-2024-004',
      type: 'warning',
      category: 'complaint',
      title: 'High Priority Complaint Escalated',
      message: 'Complaint #EEU-2024-001230 has been escalated due to no response for 24 hours.',
      timestamp: '2024-01-15T08:00:00Z',
      read: false,
      actionRequired: true,
      source: 'Complaint Management'
    },
    {
      id: 'ALERT-2024-005',
      type: 'success',
      category: 'resolution',
      title: 'Mass Outage Resolved',
      message: 'Power has been restored to all 450 customers affected by the Mercato area outage.',
      timestamp: '2024-01-14T18:30:00Z',
      read: true,
      actionRequired: false,
      source: 'Field Operations'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <Clock className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'outage':
        return <Zap className="w-4 h-4" />;
      case 'maintenance':
        return <Settings className="w-4 h-4" />;
      case 'complaint':
        return <MessageSquare className="w-4 h-4" />;
      case 'system':
        return <Info className="w-4 h-4" />;
      case 'resolution':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !alert.read) ||
                         (filter === 'action-required' && alert.actionRequired) ||
                         alert.type === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = alerts.filter(a => !a.read).length;
  const actionRequiredCount = alerts.filter(a => a.actionRequired).length;

  const markAsRead = (alertId: string) => {
    // Mark alert as read logic here
    console.log('Marking as read:', alertId);
  };

  const dismissAlert = (alertId: string) => {
    // Dismiss alert logic here
    console.log('Dismissing alert:', alertId);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">System Alerts</h1>
            <p className="text-sm text-gray-600">Monitor system notifications and alerts</p>
          </div>
        </div>
        <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
          <Bell className="w-4 h-4" />
          Mark All Read
        </Button>
      </div>

      {/* EEU Alert Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-green-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <img 
              src={eeuLogo} 
              alt="EEU Logo" 
              className="w-10 h-10 object-contain"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Ethiopian Electric Utility</h3>
              <p className="text-sm text-gray-600">Real-time system monitoring and alerts</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-red-600">{unreadCount}</div>
              <div className="text-xs text-gray-600">Unread Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-red-700">
              {alerts.filter(a => a.type === 'critical').length}
            </div>
            <div className="text-xs text-red-600">Critical</div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-yellow-700">{actionRequiredCount}</div>
            <div className="text-xs text-yellow-600">Action Required</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-blue-700">{alerts.length}</div>
            <div className="text-xs text-blue-600">Total Alerts</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter alerts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="action-required">Action Required</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">No alerts found</h3>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-l-4 transition-all hover:shadow-md ${
                alert.type === 'critical' ? 'border-l-red-500' :
                alert.type === 'warning' ? 'border-l-yellow-500' :
                alert.type === 'info' ? 'border-l-blue-500' :
                alert.type === 'success' ? 'border-l-green-500' :
                'border-l-gray-500'
              } ${!alert.read ? 'bg-gray-50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getAlertColor(alert.type).replace('text-', 'text-').replace('border-', '').replace('bg-', 'bg-')}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{alert.title}</h3>
                          {!alert.read && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(alert.category)}
                            <span className="capitalize">{alert.category}</span>
                          </div>
                          <span>•</span>
                          <span>{alert.source}</span>
                          <span>•</span>
                          <span>{formatDate(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {alert.actionRequired && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                          Action Required
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  {(alert.actionRequired || !alert.read) && (
                    <div className="flex gap-2 pt-2">
                      {!alert.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="border-green-500 text-green-700 hover:bg-green-50"
                        >
                          Mark as Read
                        </Button>
                      )}
                      {alert.actionRequired && (
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Take Action
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Alert Settings */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Alert Preferences</h4>
              <p className="text-sm text-blue-700">
                Customize your notification settings to receive the most relevant alerts for your role.
              </p>
            </div>
            <Button variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-100">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
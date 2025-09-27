import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Code,
  Server
} from 'lucide-react';

interface BackendSetupInstructionsProps {
  onClose?: () => void;
}

export function BackendSetupInstructions({ onClose }: BackendSetupInstructionsProps = {}) {
  const [copied, setCopied] = React.useState(false);

  const scriptUrl = 'https://script.google.com/home/start';
  const deployUrl = 'https://script.google.com/macros/s/AKfycbzH8vR4L3mP2qN5tO6sU9wX1yV7zA8bC4dE2fG3hI5jK6lM7nO8pQ/exec';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-500" />
            Backend Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The app is currently running in <strong>Demo Mode</strong> with mock data. 
              To use real data persistence, follow these steps to set up the Google Apps Script backend.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 1: Create Google Apps Script</h3>
              <p className="text-sm text-gray-600 mb-2">
                Go to Google Apps Script and create a new project
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(scriptUrl, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Google Apps Script
              </Button>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 2: Copy Backend Code</h3>
              <p className="text-sm text-gray-600 mb-2">
                Copy the comprehensive Google Apps Script backend code (Version 3.2.2) and paste it into your project
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Backend code features:</span>
                </div>
                <ul className="text-gray-700 space-y-1">
                  <li>• User authentication & session management</li>
                  <li>• CRUD operations for users & complaints</li>
                  <li>• Dashboard metrics & analytics</li>
                  <li>• Role-based access control</li>
                  <li>• JSONP support for cross-origin requests</li>
                  <li>• Comprehensive error handling</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 3: Configure Script Properties</h3>
              <p className="text-sm text-gray-600 mb-2">
                Set up the script properties (optional - backend will auto-create if not set):
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• SHEET_ID: Your Google Sheets ID for data storage</li>
                <li>• DRIVE_FOLDER_ID: Folder for file attachments</li>
                <li>• JWT_SECRET: Custom JWT secret key</li>
                <li>• API_KEY: Custom API key for authentication</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 4: Deploy as Web App</h3>
              <p className="text-sm text-gray-600 mb-2">
                Deploy your script as a web app with these settings:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Execute as: Me (your Google account)</li>
                <li>• Who has access: Anyone (for public access)</li>
                <li>• Version: New deployment</li>
                <li>• Copy the web app URL</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 5: Update API Configuration</h3>
              <p className="text-sm text-gray-600 mb-2">
                Update the BASE_URL in /services/api.ts with your web app deployment URL
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Replace this URL with your deployment URL:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(deployUrl)}
                    className="h-6 px-2"
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <code className="text-gray-800 break-all">{deployUrl}</code>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 6: Test & Initialize Data</h3>
              <p className="text-sm text-gray-600 mb-2">
                Test your deployment by accessing the web app URL. The backend will automatically create 
                required spreadsheet tables. Optionally, run the seed function to add test data.
              </p>
              <div className="bg-green-50 p-2 rounded text-xs">
                <strong>Auto-Setup:</strong> The backend automatically creates tables and handles missing sheets.
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Accounts:</strong> admin@eeu.gov.et/admin123, manager@eeu.gov.et/manager123, 
              staff@eeu.gov.et/staff123, technician@eeu.gov.et/tech123, customer@eeu.gov.et/customer123
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Backend API Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <div>• JWT-based authentication</div>
              <div>• Session management</div>
              <div>• User CRUD operations</div>
              <div>• Complaint management</div>
              <div>• Dashboard analytics</div>
              <div>• Notification system</div>
              <div>• Role-based permissions</div>
              <div>• Automatic fallback handling</div>
            </div>
          </div>

          {onClose && (
            <div className="flex justify-end pt-4">
              <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white">
                Got it, thanks!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';

export default function BusinessSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notificationEmails: true,
    // Add more settings fields as needed
  });

  const handleSave = () => {
    // Implement save settings logic, e.g., updating Supabase
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add settings form elements */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notificationEmails}
                onChange={(e) =>
                  setSettings({ ...settings, notificationEmails: e.target.checked })
                }
                className="mr-2"
              />
              <label>Receive notification emails</label>
            </div>
            {/* Add more settings fields as needed */}
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
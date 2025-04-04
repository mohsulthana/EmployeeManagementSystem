import { useState } from "react";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettings() {
  const { toast } = useToast();
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordRequirements: true,
    sessionTimeout: "1hour",
  });

  const [generalSettings, setGeneralSettings] = useState({
    systemNotifications: true,
    dataBackup: "weekly",
    maintenanceMode: false,
  });

  const handleSecurityChange = (key: keyof typeof securitySettings, value: any) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGeneralChange = (key: keyof typeof generalSettings, value: any) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  return (
    <Layout>
      <Card className="mb-6">
        <CardHeader className="border-b border-gray-200">
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Settings */}
            <div>
              <h4 className="text-md font-medium mb-4">Security Settings</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for all admins</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(value) => handleSecurityChange("twoFactorAuth", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Requirements</p>
                    <p className="text-sm text-gray-500">Minimum 12 characters with special symbols</p>
                  </div>
                  <Switch
                    checked={securitySettings.passwordRequirements}
                    onCheckedChange={(value) => handleSecurityChange("passwordRequirements", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                  </div>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) => handleSecurityChange("sessionTimeout", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="4hours">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div>
              <h4 className="text-md font-medium mb-4">General Settings</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Notifications</p>
                    <p className="text-sm text-gray-500">Email alerts for system events</p>
                  </div>
                  <Switch
                    checked={generalSettings.systemNotifications}
                    onCheckedChange={(value) => handleGeneralChange("systemNotifications", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Backup</p>
                    <p className="text-sm text-gray-500">Automatic database backup schedule</p>
                  </div>
                  <Select
                    value={generalSettings.dataBackup}
                    onValueChange={(value) => handleGeneralChange("dataBackup", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Temporarily disable system access</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(value) => handleGeneralChange("maintenanceMode", value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

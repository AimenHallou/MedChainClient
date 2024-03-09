import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute('/settings')({
    component: Settings,

    onEnter: () => {
        document.title = 'Settings | MedChain';
    },
});

function StatusIndicator({ isConnected }) {
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {isConnected ? 'Connected' : 'Not Connected'}
    </span>
  );
}

function SettingsCard({ title, address, isConnected }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Address: {address}</CardDescription>
      </CardHeader>
      <CardContent>
        <StatusIndicator isConnected={isConnected} />
      </CardContent>
      <CardFooter>
        <p>Status: {isConnected ? 'Connected' : 'Not Connected'}</p>
      </CardFooter>
    </Card>
  );
}

export function Settings() {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-semibold leading-tight text-white">Settings</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SettingsCard title="Server" address="192.168.1.1" isConnected={true} />
          <SettingsCard title="Database" address="192.168.1.2" isConnected={false} />
          <SettingsCard title="Blockchain" address="192.168.1.3" isConnected={true} />
        </div>
      </div>
    </div>
  );
}

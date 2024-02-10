import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
    component: Settings,

    onEnter: () => {
        document.title = 'Settings | MedChain';
    },
});

function Settings() {
    return (
        <div>
            <h1>Settings</h1>
        </div>
    );
}

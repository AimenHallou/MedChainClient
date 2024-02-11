import AllPatientsModule from '@/components/Dashboard/AllPatientsModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import PatientSummary from '../components/Dashboard/PatientSummary';
import RecentPatients from '../components/Dashboard/RecentPatients';
import AddPatientDialog from '@/components/Dashboard/AddPatientDialog';
import MyPatientsModule from '@/components/Dashboard/MyPatientsModule';
import PatientsSharedWithMeModule from '@/components/Dashboard/PatientSharedWithMeModule';

export const Route = createFileRoute('/')({
    component: () => <Index />,
    onEnter: () => {
        document.title = 'Home | MedChain';
    },
});

function Index() {
    return (
        <div className='flex-grow h-full'>
            <div className='max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-10 gap-4 mt-5'>
                <div className='col-span-2 gap-4'>
                    <PatientSummary />

                    <RecentPatients className='mt-4' />
                </div>
                <div className='col-span-8 relative'>
                    <AddPatientDialog className='absolute right-0' />

                    <Tabs defaultValue='all'>
                        <TabsList>
                            <TabsTrigger value='all'>All Patients</TabsTrigger>
                            <TabsTrigger value='myPatients'>My Patients</TabsTrigger>
                            <TabsTrigger value='sharedWithMe'>Shared with me</TabsTrigger>
                        </TabsList>

                        <TabsContent value='all'>
                            <AllPatientsModule />
                        </TabsContent>
                        <TabsContent value='myPatients'>
                            <MyPatientsModule />
                        </TabsContent>
                        <TabsContent value='sharedWithMe'>
                            <PatientsSharedWithMeModule />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

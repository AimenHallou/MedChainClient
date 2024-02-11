import { IHistoryEvent } from '@/types/patient';

interface Props {
    history: IHistoryEvent[];
}

const History = ({ history }: Props) => {
    return (
        <div className='grid gap-3'>
            {history.map((event, i) => {
                return (
                    <div key={i} className='grid gap-2 border rounded-xl px-5 py-5'>
                        <p className='text-sm font-semibold bg-primary text-primary-foreground px-2.5 rounded-lg w-fit'>{event.eventType.toUpperCase()}</p>
                        {event.by && <p className='text-sm'>By {event.by}</p>}
                        {event.to && <p className='text-sm'>To {event.to}</p>}
                        {event.with && <p className='text-sm'>With {event.with}</p>}
                        <p className='text-xs text-muted-foreground'>{new Date(event.timestamp).toISOString()}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default History;

import { IHistoryEvent } from '@/types/patient';
import { shortenAddress } from '@/utils/shortenAddress';

interface Props {
    history: IHistoryEvent[];
}

const History = ({ history }: Props) => {
    return (
        <div>
            {history.map((event, i) => {
                return (
                    <div key={i} className='grid gap-2 border rounded-xl px-5 py-5'>
                        <p className='text-sm font-semibold bg-primary text-primary-foreground px-2.5 rounded-lg w-fit'>{event.eventType.toUpperCase()}</p>
                        {event.by && <p className='text-sm'>By {shortenAddress(event.by)}</p>}
                        <p className='text-xs text-muted-foreground'>{new Date(event.timestamp).toISOString()}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default History;

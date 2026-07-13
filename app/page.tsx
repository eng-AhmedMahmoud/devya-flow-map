import { Shell } from '@/components/ui/shell';
import { AssistantChat } from '@/components/assistant-chat';

export const dynamic = 'force-dynamic';

// "Ask Devya" — the system dashboard's front door: a chat grounded in the
// company docs. The old system map moved to /map.
export default function AskDevyaPage() {
  return (
    <Shell>
      <AssistantChat />
    </Shell>
  );
}

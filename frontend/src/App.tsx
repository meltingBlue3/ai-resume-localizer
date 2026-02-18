import { BrowserRouter } from 'react-router';
import * as Tooltip from '@radix-ui/react-tooltip';
import WizardShell from './components/wizard/WizardShell.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Tooltip.Provider delayDuration={300}>
        <WizardShell />
      </Tooltip.Provider>
    </BrowserRouter>
  );
}

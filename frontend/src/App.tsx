import { BrowserRouter } from 'react-router';
import WizardShell from './components/wizard/WizardShell.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <WizardShell />
    </BrowserRouter>
  );
}

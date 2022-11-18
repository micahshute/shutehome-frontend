import './App.css';
import { ToastProvider } from 'react-toast-notifications';
import AuthApp from './authentication';
import UserProvider from './UserProvider';
import AppChooser from './AppChooser';

function App() {

  return (
   <ToastProvider autoDismiss autoDismissTimeout={5000}>
      <UserProvider LoginApp={AuthApp}>
        <AppChooser />
      </UserProvider>
   </ToastProvider> 
  )
}
export default App;

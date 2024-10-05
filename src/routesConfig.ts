import { RouteObject } from 'react-router-dom';
import RegistrationForm from './components/registrationForm/RegistrationForm';
import App from './App';
import MainPageCurator from './pages/Curator/MainPageCurator';

const routerConfig: RouteObject[] = [
  {
    path: '/',
    Component: App,
  },
  {
    path: '/registration',
    Component: RegistrationForm,
  },
  {
    path: '/curator',
    Component: MainPageCurator,
  },
];

export default routerConfig;

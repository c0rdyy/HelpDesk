import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './router/root-layout';
import { RootRedirect } from './router/root-redirect';

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <RootRedirect /> }
        ]
    }
])
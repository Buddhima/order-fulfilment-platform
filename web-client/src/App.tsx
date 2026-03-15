import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import CreateOrderPage from './pages/CreateOrderPage';

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/">
            <Redirect to="/orders" />
          </Route>

          <Route path="/orders" component={OrdersPage} exact />
          <Route path="/orders/:id" component={OrderDetailsPage} exact />
          <Route path="/create-order" component={CreateOrderPage} exact />

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
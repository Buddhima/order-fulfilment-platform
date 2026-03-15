import { IonItem, IonLabel, IonBadge } from "@ionic/react";
import { useHistory } from "react-router";

export default function OrderCard({ order }: any) {

    const history = useHistory();

    return (
        <IonItem button onClick={() => history.push(`/orders/${order.id}`)}>
            <IonLabel>
                <h2>Order #{order.id}</h2>
                <p>Customer: {order.customerIdentifier}</p>
            </IonLabel>
            <IonBadge color={
                order.status === "PENDING" ? "warning" :
                    order.status === "CONFIRMED" ? "success" :
                        "danger"
            }>
                {order.status}
            </IonBadge>
        </IonItem>
    );
}
import { IonItem, IonLabel, IonBadge, useIonRouter } from "@ionic/react";

export default function OrderCard({ order }: any) {

    const router = useIonRouter();

    return (
        <IonItem button onClick={() => router.push(`/orders/${order.id}`)}>
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
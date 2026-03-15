import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonList,
    IonButtons,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent
} from "@ionic/react";

import { useQuery } from "@apollo/client/react";
import { GET_ORDERS } from "../api/queries";
import OrderCard from "../components/OrderCard";
import { useState, useEffect } from 'react';
import { addOutline } from 'ionicons/icons';

export default function OrdersPage() {

    const [status, setStatus] = useState<string>('ALL');

    // Map "All" to undefined for the query
    const { data, refetch } = useQuery(GET_ORDERS, {
        variables: { status: status === 'ALL' ? undefined : status },
    });

    // Refetch when status changes
    useEffect(() => {
        refetch({ status: status === 'ALL' ? undefined : status });
    }, [status, refetch]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Orders</IonTitle>
                    <IonButtons slot="end">
                        <IonButton
                            routerLink="/create-order"
                            fill="solid"
                            color="primary"
                        >
                            <IonIcon icon={addOutline} slot="start" />
                            Create Order
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonCard color="light" className="ion-padding">

                    <IonCardContent>
                        <IonItem lines="none">
                            <IonLabel position="stacked">Status</IonLabel>
                            <IonSelect
                                value={status}
                                placeholder="Select status"
                                onIonChange={(e) => setStatus(e.detail.value)}
                                interfaceOptions={{
                                    header: 'Choose a status',
                                }}
                            >
                                <IonSelectOption value="ALL">ALL</IonSelectOption>
                                <IonSelectOption value="PENDING">PENDING</IonSelectOption>
                                <IonSelectOption value="CONFIRMED">CONFIRMED</IonSelectOption>
                                <IonSelectOption value="FAILED">FAILED</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </IonCardContent>
                </IonCard>

                <IonList>
                    {data?.orders?.map((order: any) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </IonList>

            </IonContent>
        </IonPage>


    );
}
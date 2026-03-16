import {
  IonPage,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAlert,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonBadge
} from "@ionic/react";

import { useState } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_ORDER } from "../api/queries";
import { CONFIRM_ORDER } from "../api/mutations";

export default function OrderDetailsPage() {

  const { id } = useParams<any>();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data, loading, refetch } = useQuery(GET_ORDER, {
    variables: { id }
  });

  const [confirmOrder, { loading: confirming }] = useMutation(CONFIRM_ORDER);

  const order = data?.order;

  const handleConfirm = async () => {
    try {
      const result = await confirmOrder({ variables: { id } });
      refetch();

      if (result.data.confirmOrder.status == "CONFIRMED")
        setSuccessMessage("Order confirmed successfully!");
      else
        setErrorMessage("Failed to confirm order");

    } catch (error) {
      setErrorMessage(error.message || "Failed to confirm order");
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/orders" />
          </IonButtons>
          <IonTitle>Order Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Order {order?.id}</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonItem>
              <IonLabel>
                <strong>Status</strong>
                <br />
                <IonBadge color={
                  order.status === "PENDING" ? "warning" :
                    order.status === "CONFIRMED" ? "success" :
                      "danger"
                }>
                  {order.status}
                </IonBadge>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <strong>Customer</strong>
                <p>{order?.customerIdentifier}</p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <strong>Destination Postal Code</strong>
                <p>{order?.destinationPostalCode}</p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <strong>Shipping Amount</strong>
                <p>${order?.shippingAmount}</p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <strong>Fraud Score</strong>
                <p>{order?.fraudScore}</p>
              </IonLabel>
            </IonItem>

            {order?.latestError && (
              <IonItem color="danger">
                <IonLabel>
                  <strong>Error</strong>
                  <p>{order.latestError}</p>
                </IonLabel>
              </IonItem>
            )}

            <IonItem>
              <IonLabel>
                <strong>Created</strong>
                <p>
                  {order?.createdAt &&
                    new Date(order.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                </p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <strong>Updated</strong>
                <p>
                  {order?.updatedAt &&
                    new Date(order.updatedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                </p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Items</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonList>
              {order?.items?.map((item: any) => (
                <IonItem key={item.sku}>
                  <IonLabel>
                    <strong>{item.sku}</strong>
                    <p>Quantity: {item.quantity}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        {order?.status === "PENDING" && (
          <IonButton
            expand="block"
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? "Confirming..." : "Confirm Order"}
          </IonButton>
        )}

        <IonAlert
          isOpen={!!errorMessage}
          onDidDismiss={() => setErrorMessage("")}
          header="Error"
          message={errorMessage}
          buttons={["OK"]}
        />

        <IonAlert
          isOpen={!!successMessage}
          onDidDismiss={() => setSuccessMessage("")}
          header="Success"
          message={successMessage}
          buttons={["OK"]}
        />

      </IonContent>

    </IonPage>
  );
}
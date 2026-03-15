import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  useIonAlert,
  useIonRouter,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonIcon
} from "@ionic/react";

import { useState } from "react";
import { closeOutline } from 'ionicons/icons';
import { useMutation } from "@apollo/client/react";
import { CREATE_ORDER } from "../api/mutations";

export default function CreateOrderPage() {

  const router = useIonRouter();
  const [presentAlert] = useIonAlert();
  const [customerIdentifier, setCustomerIdentifier] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [items, setItems] = useState<{ sku: string, quantity: number }[]>([
    { sku: "", quantity: 1 }
  ]);

  const [createOrder, { data, loading, error }] = useMutation(CREATE_ORDER);

  const submit = async () => {

    if (items.length < 1) {
      console.error('Item list is empty');
    }

    // Validate data
    if (!customerIdentifier) {
      return presentAlert({ header: "Validation Error", message: "Customer Identifier is required", buttons: ["OK"] });
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].sku) {
        return presentAlert({ header: "Validation Error", message: `Item #${i + 1} SKU is required`, buttons: ["OK"] });
      }
      if (items[i].quantity <= 0) {
        return presentAlert({ header: "Validation Error", message: `Item #${i + 1} quantity must be above 0`, buttons: ["OK"] });
      }
    }

    try {
      const result = await createOrder({
        variables: {
          input: {
            customerIdentifier,
            destinationPostalCode: postalCode,
            items
          }
        }
      });

      const orderId = result.data.createOrder.id;

      presentAlert({
        header: "Order Created",
        message: `Order ID: ${orderId}`,
        buttons: [
          {
            text: "OK",
            handler: () => {
              router.push("/orders", "forward");
            }
          }
        ]
      });
    } catch (error) {
      console.error(error);
    }

  };

  const updateItem = (index: number, field: "sku" | "quantity", value: string) => {
    const newItems = [...items];
    newItems[index][field] = field === "quantity" ? parseInt(value) : value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { sku: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/orders" />
          </IonButtons>
          <IonTitle>Create Order</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Customer Details</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Customer Identifier *</IonLabel>
              <IonInput
                value={customerIdentifier}
                placeholder="Customer Identifier"
                onIonChange={(e: any) => setCustomerIdentifier(e.detail.value)}
                errorText="Customer Identifier is required"
                required
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Postal Code</IonLabel>
              <IonInput
                value={postalCode}
                placeholder="Postal Code"
                onIonChange={(e: any) => setPostalCode(e.detail.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxlength={5}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Items *</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {items.map((item, index) => (
              <IonItem key={index}>
                <IonLabel position="stacked">SKU *</IonLabel>
                <IonInput
                  placeholder="Item SKU"
                  value={item.sku}
                  onIonChange={(e: any) => updateItem(index, "sku", e.detail.value)}
                  required
                />
                <IonLabel position="stacked">Quantity *</IonLabel>
                <IonInput
                  type="number"
                  min={1}
                  value={item.quantity}
                  onIonChange={(e: any) => updateItem(index, "quantity", e.detail.value)}
                  required
                />
                {items.length > 1 && (
                  <IonButton
                    fill="clear"
                    color="danger"
                    onClick={() => removeItem(index)}
                    slot="end"
                  >
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                )}
              </IonItem>
            ))}

            <IonButton onClick={addItem}>Add Item</IonButton>

          </IonCardContent>
        </IonCard>

        <IonButton expand="block" onClick={submit} disabled={loading}>
          {loading ? <IonSpinner name="crescent" /> : "Create Order"}
        </IonButton>

        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}


      </IonContent>
    </IonPage >
  );
}
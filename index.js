const express = require("express");
const app = express();
const port = 3000;

const freeTypeId = "9a4f1cbe-3d7f-4595-81c2-5c1e06a60f21";
const addressKey = "exampleKey";

app.use(express.json());

app.get("/health", (req, res) => {
  res.send({ message: "marin" });
});

app.post("/extension", (req, res) => {
  const { action, resource, ...rest } = req.body;
  console.log("########################");
  console.log("Received action:", action);
  console.log("Resource:", resource);
  console.log("########################");
  console.log(rest);
  const cart = req.body.resource.obj;
  console.log(cart.lineItems);
  const actions = [];

  if (action === "Update") {
    const freeItemInCart = cart.lineItems.some(
      (item) =>
        item.custom && item.custom.type && item.custom.type.id === freeTypeId
    );

    const totalPrice = cart.totalPrice.centAmount;
    const threshold = 2000;

    const addressExists = cart.itemShippingAddresses.some(
      (address) => address.key === addressKey
    );

    if (!addressExists) {
      // Add the address if it doesn't exist
      actions.push({
        action: "addItemShippingAddress",
        address: {
          key: addressKey,
          streetName: "Example Street",
          city: "Example City",
          postalCode: "12345",
          country: "DE",
        },
      });
    }

    if (!freeItemInCart && totalPrice > threshold) {
      actions.push({
        action: "addLineItem",
        productId: "cf7a1d03-42fd-47f9-8bbc-35d65bc61197",
        variantId: 1,
        quantity: 1,
        supplyChannel: {
          typeId: "channel",
          id: "81505a36-2867-42ec-af74-5c21cd82ecdc",
        },
        externalPrice: {
          currencyCode: "EUR",
          centAmount: 0,
        },

        shippingDetails: {
          targets: [
            {
              addressKey: "exampleKey",
              quantity: 2,
            },
          ],
        },
        custom: {
          type: {
            typeId: "type",
            id: freeTypeId,
          },
        },
      });
    } else if (freeItemInCart && totalPrice <= threshold) {
      actions.push({
        action: "removeLineItem",
        lineItemId: '0168f47e-fb8f-49ff-9d51-4da3bcfac553',
        quantity: 1,
        externalPrice: {
          currencyCode: "EUR",
          centAmount: 0,
        },
        shippingDetailsToRemove: {
          targets: [
            {
              addressKey: "exampleKey",
              quantity: 2,
            },
          ],
        },
      });
    }
  }

  console.log("########################");
  console.log(actions);
  if (actions.length > 0) {
    return res.status(200).json({
      actions: actions,
    });
  }

  // if (cart.discountCodes.length === 0 && cart.lineItems.length > 0 && action === "Update") {
  // return res.status(200).json({
  //     "actions": [
  //         {
  //             "action" : "addDiscountCode",
  //             "code" : "recitejojdabeznje"
  //           }
  //     ]
  // })
  // }
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

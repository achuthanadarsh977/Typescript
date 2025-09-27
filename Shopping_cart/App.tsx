import { useState } from "react";
import { useQuery } from "react-query";

import {Drawer} from "@mui/material";
import { LinearProgress } from "@mui/material";

import {Grid} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material"

import Badge from "@mui/material";

import { Wrapper } from "./App.styles";


export type CartItemType = {
  id:number;
  category:string;
  description:string;
  image:string;
  price:number;
  title:string;
  quantity:number;
}


const getProducts = async (): Promise<CartItemType[]> => {
  return [
    {
      id: 1,
      category: "electronics",
      description: "Product A description",
      image: "https://example.com/product-a.jpg",
      price: 100,
      title: "Product A",
      quantity: 1,
    },
    {
      id: 2,
      category: "clothing",
      description: "Product B description",
      image: "https://example.com/product-b.jpg",
      price: 150,
      title: "Product B",
      quantity: 3,
    },
  ];
};


const App: React.FC = () => {
  const { data, isLoading, error } = useQuery<CartItemType[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });
  
  console.log(data)
  const getTotalItems = () => null  
  const handletocart = (clickedItem: CartItemType) => null
  const handleRemoveFromCart = () => null

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return (
    <div className="App">
      <h1>Products</h1>
      {data?.map(item => (
        <div key={item.id}>
          <p>{item.title} - ${item.price} (Qty: {item.quantity})</p>
        </div>
      ))}
    </div>
  );
};



export default App;